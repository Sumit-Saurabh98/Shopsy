import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import Coupon from "../models/coupon.model.js";
import stripe from "../lib/stripe.js";
import redis from "../lib/redis.js";
import { createNewCoupon, createStripeCoupon } from "../helper/stripeHelper.js";
import Order from "../models/order.model.js";
import { IUser } from "../lib/interfaces.js";

export const createCheckoutSession = async (req: Request, res: Response) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.log("Error in createCheckoutSession:", error);
        res.status(500).json({ message: "Internal server error: " + error });
	}
};

export const checkoutSuccess = async (req: Request, res: Response) => {
	const userId = (req.user as IUser)?._id;
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(!session) {
            return res.status(404).json({message: "Session not found"});
        }

        if(session.payment_status === "paid"){
            if(session.metadata?.couponCode){
                await Coupon.findOneAndUpdate({code: session.metadata.couponCode, userId: session.metadata.userId}, {isActive: false});
            }

            // create a new order

            if(session.metadata?.products){
                const products = JSON.parse(session.metadata.products);
                const newOrder = new Order({
                    userId: session.metadata.userId,
                    products: products.map((product:any) => ({
                        productId: product.id,
                        quantity: product.quantity,
                        price: product.price
                    })),
                    totalAmount: session.amount_total! / 100,
                    stripeSessionId: sessionId,
                });
                await newOrder.save();

				// update in the redis store

				const updatedOrders = await Order.find({ userId}).populate({
					path: 'products.productId',
					model: 'Product'
				  });

				await redis.set(`customer_orders_${userId}`, JSON.stringify(updatedOrders), "EX", 36000);

                res.status(200).json({
                    success: true, 
                    message: "Payment successful, order created, and coupon deactivated if used.", 
                    orderId: newOrder._id
                });
            }else{
                return res.status(404).json({message: "Products not found in the session metadata"});
            }
        }
    } catch (error) {
        console.log("Error in checkoutSuccess:", error);
        res.status(500).json({ message: "Internal server error: " + error });
    }
}