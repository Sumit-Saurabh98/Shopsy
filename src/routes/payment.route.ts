import express, { RequestHandler } from "express";
import { protectRoute } from "../middlewares/authenticate.middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router();

// Type assertion for proper RequestHandler typing
router.post(
    "/create-checkout-session", 
    protectRoute, 
    createCheckoutSession as RequestHandler
);

router.post(
    "/checkout-success", 
    protectRoute,
    checkoutSuccess as RequestHandler
);

// Optional: Add a debug route to test session retrieval
router.get(
    "/test-session/:sessionId", 
    protectRoute, 
    async (req, res) => {
        try {
            const stripe = (await import("../lib/stripe.js")).default;
            const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
            res.json({
                id: session.id,
                payment_status: session.payment_status,
                metadata: session.metadata,
                amount_total: session.amount_total
            });
        } catch (error: any) {
            res.status(500).json({ 
                error: error?.message || "Failed to retrieve session" 
            });
        }
    }
);

export default router;