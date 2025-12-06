import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import database connection
import connectDB from "./config/database.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

// Import initialization utility
import { initializeData } from "./utils/initData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// helmet csp blocked for xhr requests
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": [helmet.NONE],
        "img-src": [helmet.SELF],
      },
    },
  })
);
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// HTTP request logger middleware
app.use(morgan("dev")); // 'dev' format: :method :url :status :response-time ms - :res[content-length]

// Connect to MongoDB
connectDB();

// Initialize default data
initializeData();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", paymentRoutes);
app.use("/api/favorites", favoriteRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
