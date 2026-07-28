require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/Auth");
const productRoutes = require("./routes/Product");
const orderRoutes = require("./routes/Order");
const cartRoutes = require("./routes/Cart");
const brandRoutes = require("./routes/Brand");
const categoryRoutes = require("./routes/Category");
const userRoutes = require("./routes/User");
const addressRoutes = require("./routes/Address");
const reviewRoutes = require("./routes/Review");
const wishlistRoutes = require("./routes/Wishlist");
const paymentRoutes = require("./routes/payment");
const couponRoutes = require("./routes/Coupon");
const bannerRoutes = require("./routes/Banner");
const adminRoutes = require("./routes/Admin");
const storefrontRoutes = require("./routes/Storefront");
const searchRoutes = require("./routes/Search");
const { connectToDB } = require("./database/db");

const server = express();

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");
const isVercelOrigin = (origin = "") => {
    try {
        const { hostname } = new URL(origin);
        return hostname.endsWith(".vercel.app");
    } catch (error) {
        return false;
    }
};

const isLocalOrigin = (origin = "") => {
    try {
        const { hostname } = new URL(origin);
        return hostname === "localhost" || hostname === "127.0.0.1";
    } catch (error) {
        return false;
    }
};

const allowedOrigins = (process.env.ORIGIN || "http://localhost:3000")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

server.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }

            const normalizedOrigin = normalizeOrigin(origin);
            const isAllowed =
                allowedOrigins.includes(normalizedOrigin) ||
                (process.env.ALLOW_VERCEL_PREVIEWS === "true" && isVercelOrigin(normalizedOrigin)) ||
                isLocalOrigin(normalizedOrigin);

            callback(null, isAllowed ? normalizedOrigin : false);
        },
        credentials: true,
        exposedHeaders: ["X-Total-Count"],
        methods: ["GET", "POST", "PATCH", "DELETE"],
    })
);
server.disable("x-powered-by");
server.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
});
server.use(express.json({ limit: "2mb" }));
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(morgan("tiny"));
server.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (error) {
        next(error);
    }
});

server.use("/auth", authRoutes);
server.use("/users", userRoutes);
server.use("/products", productRoutes);
server.use("/orders", orderRoutes);
server.use("/cart", cartRoutes);
server.use("/brands", brandRoutes);
server.use("/categories", categoryRoutes);
server.use("/address", addressRoutes);
server.use("/reviews", reviewRoutes);
server.use("/wishlist", wishlistRoutes);
server.use("/payments", paymentRoutes);
server.use("/coupons", couponRoutes);
server.use("/banners", bannerRoutes);
server.use("/admin", adminRoutes);
server.use("/storefront", storefrontRoutes);
server.use("/search", searchRoutes);

server.get("/", (req, res) => {
    res.status(200).json({ message: "running" });
});

server.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[request-error] ${req.method} ${req.path} status=${status} name=${err.name || "Error"}`);
    const message = status >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error";
    res.status(status).json({ message });
});

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== "production") {
    connectToDB()
        .then(() => server.listen(PORT, () => console.log(`server [STARTED] ~ http://localhost:${PORT}`)))
        .catch((error) => {
            console.error(`[startup] Database initialization failed: ${error.name || "DatabaseError"}`);
            process.exitCode = 1;
        });
}

module.exports = server;
