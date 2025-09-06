import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";
import githubRouter from "./routes/github.js";
import { serveStatic, setupVite } from "./vite.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? true : ["http://localhost:5173"],
    credentials: false,
  })
);
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://dapi.kakao.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "https:", "https://*.daumcdn.net", "https://*.kakaocdn.net"],
        "connect-src": ["'self'", "https://dapi.kakao.com", "https://api.github.com"],
      },
    },
  })
);

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

app.use("/api/github", githubRouter);

const port = Number(process.env.PORT || 5001);

async function start() {
  const httpServer = await registerRoutes(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, httpServer);
  }

  const server = app.listen(port, () => {
    console.log(
      `Server running on http://localhost:${port} (mode=${process.env.NODE_ENV || "development"})`
    );
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("[startup error]", err);
  process.exit(1);
});
