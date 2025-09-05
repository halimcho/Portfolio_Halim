import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";
import githubRouter from "./routes/github.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false,
  })
);
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

registerRoutes(app);
app.use("/api/github", githubRouter);

app.get("/", (_req, res) => {
  res.status(200).send("API server (no frontend here).");
});

app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[server error]", err);
    res.status(err?.status || 500).json({ message: err?.message || "Server Error" });
  }
);

const port = Number(process.env.PORT || 5001);
const server = app.listen(port, () => {
  console.log(`API server on http://localhost:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
