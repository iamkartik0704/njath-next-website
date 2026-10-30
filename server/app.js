import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/default.mjs";
import logger from "./utils/logger.js";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import { connectdb } from "./utils/connectDb.js";
import questionRouter from "./routes/question.route.js";
import { checkUser } from "./middlewares/checkUser.js";
import { USER_ROLE } from "./models/user.model.js";
import participantRoutes from "./routes/participant.route.js";

const app = express();

const configuredOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "https://njath.vercel.app",
  "https://njath-2023.vercel.app",
  config.frontendUrl,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
].filter(Boolean);

// -----------MIDDLEWARE-------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// HTTP request logging
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan((tokens, req, res) => {
      logger.info(
        {
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: tokens.status(req, res),
          responseTime: `${tokens["response-time"](req, res)} ms`,
        },
        "HTTP Request"
      );
      return null;
    })
  );
}

// Health check endpoint
app.get(["/", "/health"], (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "NJATH backend API is operational",
    version: "1.0.0",
  });
});

// -----------ROUTES---------------
app.use("/api/auth", authRouter);
app.use("/api/question", questionRouter);
app.use(
  "/api/participant",
  checkUser([USER_ROLE.PARTICIPANT]),
  participantRoutes
);

// Catch-all 404 handler
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// -----------START SERVER------------
const PORT = config.port || 8080;
const server = app.listen(PORT, async () => {
  logger.info(`🚀 NJATH Server is running on port ${PORT}`);
  await connectdb();
});

export default app;
