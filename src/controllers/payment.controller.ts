import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import Coupon from "../models/coupon.model.js";
import stripe from "../lib/stripe.js";
import redis from "../lib/redis.js";
import { createNewCoupon, createStripeCoupon } from "../helper/stripeHelper.js";
import Order from "../models/order.model.js";
import { IUser } from "../lib/interfaces.js";

// Define interfaces for better type safety
interface AuthenticatedRequest extends Request {
  user: IUser;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutRequestBody {
  products: Product[];
  couponCode?: string;
}

interface CheckoutSuccessRequestBody {
  sessionId: string;
}

export const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { products, couponCode }: CheckoutRequestBody = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount: number = 0;

    const lineItems = products.map((product: Product) => {
      const amount: number = Math.round(product.price * 100);
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
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
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
          products.map((p: Product) => ({
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

    return res.status(200).json({
      id: session.id,
      totalAmount: totalAmount / 100,
    });
  } catch (error: any) {
    console.log("Error in createCheckoutSession:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error?.message || "Unknown error",
    });
  }
};

export const checkoutSuccess = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  const userId = req.user?._id;

  try {
    const { sessionId }: CheckoutSuccessRequestBody = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    console.log("Session payment status:", session.payment_status);
    console.log("Session metadata:", session.metadata);

    if (session.payment_status === "paid") {
      // Deactivate coupon if used
      if (session.metadata?.couponCode) {
        try {
          await Coupon.findOneAndUpdate(
            {
              code: session.metadata.couponCode,
              userId: session.metadata.userId,
            },
            { isActive: false }
          );
          console.log("Coupon deactivated:", session.metadata.couponCode);
        } catch (couponError: any) {
          console.error("Error deactivating coupon:", couponError);
          // Don't fail the entire operation for coupon issues
        }
      }

      // Create a new order
      if (session.metadata?.products) {
        try {
          const products = JSON.parse(session.metadata.products);
          console.log("Creating order with products:", products);

          const newOrder = new Order({
            userId: session.metadata.userId,
            products: products.map((product: any) => ({
              productId: product.id,
              quantity: product.quantity,
              price: product.price,
            })),
            totalAmount: (session.amount_total || 0) / 100,
            stripeSessionId: sessionId,
          });

          const savedOrder = await newOrder.save();
          console.log("Order created successfully:", savedOrder._id);

          // Update Redis cache
          try {
            const updatedOrders = await Order.find({ userId }).populate({
              path: "products.productId",
              model: "Product",
            });

            await redis.set(
              `customer_orders_${userId}`,
              JSON.stringify(updatedOrders),
              "EX",
              36000
            );
            console.log("Redis cache updated for user:", userId);
          } catch (redisError: any) {
            console.log("Redis update failed (non-critical):", redisError);
            // Don't fail the entire operation if Redis fails
          }

          return res.status(200).json({
            success: true,
            message:
              "Payment successful, order created, and coupon deactivated if used.",
            orderId: savedOrder._id,
          });
        } catch (orderError: any) {
          console.error("Error creating order:", orderError);
          return res.status(500).json({
            success: false,
            message: "Payment successful but failed to create order",
            error: orderError?.message || "Order creation failed",
          });
        }
      } else {
        console.log("No products found in session metadata");
        return res.status(400).json({
          success: false,
          message: "Products not found in the session metadata",
        });
      }
    } else {
      console.log("Payment not completed. Status:", session.payment_status);
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        paymentStatus: session.payment_status,
      });
    }
  } catch (error: any) {
    console.error("Error in checkoutSuccess:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || "Unknown error",
    });
  }
};
