import "dotenv/config";
import { initSentry, Sentry } from "./lib/sentry.js";
initSentry(); // Must be first

import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { prisma } from "./lib/prisma.js";
import { startEmailWorker, stopEmailWorker } from "./workers/email-bullmq-worker.js";
import { startWebhookRetryWorker, stopWebhookRetryWorker } from "./workers/webhook-retry-worker.js";
import { startStockSyncWorker, stopStockSyncWorker } from "./workers/stock-sync-worker.js";
import { startTrackingPollWorker, stopTrackingPollWorker } from "./workers/tracking-poll-worker.js";
import { getStockQueue, getTrackingQueue } from "./lib/queue.js";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import componentRoutes from "./features/components/routes/component.routes.js";
import projectRoutes from "./features/projects/routes/project.routes.js";
import orderRoutes from "./features/orders/routes/order.routes.js";
import addressRoutes from "./features/addresses/routes/address.routes.js";
import couponRoutes from "./features/coupons/routes/coupon.routes.js";
import cartRoutes from "./features/cart/routes/cart.routes.js";
import wishlistRoutes from "./features/wishlist/routes/wishlist.routes.js";
import paymentRoutes from "./features/payments/routes/payment.routes.js";
import shippingRoutes from "./features/shipping/routes/shipping.routes.js";
import pcbRoutes from "./features/pcb/routes/pcb.routes.js";
import reviewRoutes from "./features/reviews/routes/review.routes.js";
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
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.ADMIN_FRONTEND_URL || "http://localhost:3002",
  "https://robo-gig.vercel.app",
  vercelOrigin,
  ...configuredOrigins,
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
].filter(Boolean);

function isAllowedVercelPreview(origin: string) {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app") && hostname.includes("robo-gig");
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cookie parsing middleware
app.use(cookieParser());

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

// Rate limiting on auth endpoints — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order/payment creation — prevent accidental double-submission spam
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin write operations — prevent bulk automated changes
const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: "Admin rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public catalog — generous limit
const catalogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/admin", adminWriteLimiter, adminRoutes);
app.use("/api/components", catalogLimiter, componentRoutes);
app.use("/api/projects", catalogLimiter, projectRoutes);
app.use("/api/orders", orderLimiter, orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin/coupons", adminWriteLimiter, couponRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", orderLimiter, cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", orderLimiter, paymentRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/pcb", pcbRoutes);
app.use("/api/reviews", reviewRoutes);

// 404 handler
app.use(notFoundHandler);

// Sentry error handler must be before the generic error handler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Global error handler
app.use(errorHandler);

// Auto-cancel stale PENDING_PAYMENT orders after 30 minutes + restore stock
cron.schedule("*/5 * * * *", async () => {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const stale = await prisma.order.findMany({
      where: { status: "PENDING_PAYMENT", createdAt: { lt: cutoff } },
      include: { items: { select: { componentId: true, quantity: true } } },
    });

    for (const order of stale) {
      await prisma.$transaction(async (tx) => {
        // Restore stock
        await Promise.all(
          order.items
            .filter((i) => i.componentId)
            .map((i) =>
              tx.component.update({
                where: { id: i.componentId! },
                data: { stockQuantity: { increment: i.quantity } },
              })
            )
        );
        await tx.payment.updateMany({
          where: { orderId: order.id, status: "CREATED" },
          data: { status: "FAILED" },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED", notes: "Auto-cancelled: payment not completed within 30 minutes" },
        });
      });
      console.log(`[OrderExpiry] Auto-cancelled order ${order.id} (stock restored)`);
    }
  } catch (err) {
    console.error("[OrderExpiry] Failed:", err);
  }
});

// Session cleanup — run daily at 3:07am to delete expired sessions
cron.schedule("7 3 * * *", async () => {
  try {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[SessionCleanup] Deleted ${result.count} expired sessions`);
  } catch (err) {
    console.error("[SessionCleanup] Failed:", err);
  }
});

// Stock sync — run every hour to check low-stock components
cron.schedule("13 * * * *", async () => {
  const stockQueue = getStockQueue();
  if (stockQueue) {
    await stockQueue.add("check-all", {}).catch((err: Error) =>
      console.error("[StockSync] Failed to enqueue:", err.message),
    );
  }
});

// Tracking poll — run every 30 minutes for all SHIPPED orders
cron.schedule("*/30 * * * *", async () => {
  const trackingQueue = getTrackingQueue();
  if (!trackingQueue) return;

  const shippedOrders = await prisma.order.findMany({
    where: { status: { in: ["SHIPPED", "OUT_FOR_DELIVERY"] }, trackingAwb: { not: null } },
    select: { id: true, trackingAwb: true },
  }).catch(() => []);

  for (const order of shippedOrders) {
    if (!order.trackingAwb) continue;
    await trackingQueue.add(`poll-${order.id}`, { orderId: order.id, awb: order.trackingAwb }, {
      jobId: `track-${order.id}`, // deduplicate — one poll per order at a time
    }).catch(() => null);
  }
  if (shippedOrders.length > 0) {
    console.log(`[TrackingPoll] Queued ${shippedOrders.length} shipment(s) for tracking update`);
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server is running on http://localhost:${PORT}
    📝 Environment: ${NODE_ENV}
    🔐 Auth endpoints available at http://localhost:${PORT}/api/auth
  `);

  startEmailWorker();
  startWebhookRetryWorker();
  startStockSyncWorker();
  startTrackingPollWorker();
});

// Graceful shutdown — drain email worker before exit
async function shutdown(signal: string) {
  console.log(`[Server] ${signal} received — shutting down`);
  server.close(async () => {
    await Promise.all([
      stopEmailWorker(),
      stopWebhookRetryWorker(),
      stopStockSyncWorker(),
      stopTrackingPollWorker(),
    ]);
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
