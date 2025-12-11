import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import componentRoutes from "./features/components/routes/component.routes.js";
import projectRoutes from "./features/projects/routes/project.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production",
  crossOriginEmbedderPolicy: NODE_ENV === "production",
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "RoboGig API is running",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/projects", projectRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
    🚀 Server is running on http://localhost:${PORT}
    📝 Environment: ${NODE_ENV}
    🔐 Auth endpoints available at http://localhost:${PORT}/api/auth
  `);
});