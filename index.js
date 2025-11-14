import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
// Load environment variables
dotenv.config();
// importing routes
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import productRouter from "./route/product.route.js";
<<<<<<< HEAD
import { addAddressController } from "./controllers/address.controller.js";
=======
import cartRouter from "./route/cart.route.js";
import homeSlidesRouter from "./route/homeSlides.route.js";


>>>>>>> 20ed87c906445456ff07c2443946fa0e2f3d02f2

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // handles OPTIONS preflight automatically
app.use(morgan("dev"));
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(cookieParser());

// // Example API route
app.get("/", (request, response) => {
    response.json({ message: "server is running " + process.env.PORT });
});

app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
<<<<<<< HEAD
app.use('/api/address', addAddressController);

=======
app.use('/api/cart', cartRouter);
app.use('/api/homeSlides', homeSlidesRouter);
>>>>>>> 20ed87c906445456ff07c2443946fa0e2f3d02f2

// Start server after DB connection
const PORT = process.env.PORT || 8000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });



