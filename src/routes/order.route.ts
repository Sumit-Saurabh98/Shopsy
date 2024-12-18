import express from "express";
import { protectRoute } from "../middlewares/authenticate.middleware.js";
import { customerOrders, getAllOrders, updateOrderStatus } from "../controllers/orders.controller.js";
import { adminRoute } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.get("/customer-orders", protectRoute, customerOrders as express.RequestHandler);
router.get("/", protectRoute, adminRoute, getAllOrders as express.RequestHandler);
router.patch('/update-status', protectRoute, adminRoute, updateOrderStatus as express.RequestHandler);

export default router