import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { registerRoutes } from "./routes.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const clientRoot = resolve(projectRoot, "client");
const clientDist = resolve(projectRoot, "client_dist");
const viteConfigPath = resolve(projectRoot, "vite.config.ts");

const app = express();

app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));


registerRoutes(app);

async function attachFrontend() {
  const isProd = process.env.NODE_ENV === "production";
  console.log(`[bootstrap] mode=${isProd ? "production" : "development"}`);

  if (isProd) {
    app.use(
      helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://dapi.kakao.com"], 
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https://dapi.kakao.com", "https://api.github.com"], 
    },
  },
})



    );
  }

  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      configFile: viteConfigPath,
      server: { middlewareMode: true },
      appType: "spa",
      logLevel: "info",
    });

    app.use(vite.middlewares);

    app.get(/^(?!\/api\/).*/, async (req, res, next) => {
      try {
        const indexHtmlPath = resolve(clientRoot, "index.html");
        let html = fs.readFileSync(indexHtmlPath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace?.(e as Error);
        next(e);
      }
    });

    const closeVite = async () => {
      try {
        await vite.close();
      } finally {
        process.exit(0);
      }
    };
    process.on("SIGINT", closeVite);
    process.on("SIGTERM", closeVite);
  } else {
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.get(/^(?!\/api\/).*/, (_req, res) => {
        res.sendFile(resolve(clientDist, "index.html"));
      });
    } else {
      app.get(/^(?!\/api\/).*/, (_req, res) => {
        res.status(500).send("client_dist not found. Run 'npm run build'.");
      });
    }
  }
}

await attachFrontend();

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

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
  console.log(`Server on http://localhost:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
