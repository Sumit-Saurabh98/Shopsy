import { Application, Request, Response } from "express";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js"
import path from "path";


const app: Application = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.get("/test", (req:Request, res:Response) => {
    res.send("Server is working....")
})

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/orders', orderRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "client", "dist")));
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Listening on port ${PORT}`);
});