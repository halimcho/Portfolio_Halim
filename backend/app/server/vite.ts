import express, { type Express } from "express";
import fs from "fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  createServer as createViteServer,
  createLogger,
  type InlineConfig,
  type ViteDevServer,
} from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const clientRoot = resolve(projectRoot, "client");
const clientDist = resolve(projectRoot, "client_dist");

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}


export async function setupVite(app: Express, httpServer: Server): Promise<ViteDevServer> {
  const inlineConfig: InlineConfig = {
    root: clientRoot,
    appType: "spa",
    configFile: false, 
    server: {
      middlewareMode: true,
      host: true,
      hmr: { server: httpServer },
    },
    resolve: {
      alias: {
        "@": resolve(projectRoot, "client", "src"),
        "@shared": resolve(projectRoot, "shared"),
        "@assets": resolve(projectRoot, "attached_assets"),
      },
    },
  };

  const vite = await createViteServer({
    ...inlineConfig,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  app.use(vite.middlewares);

  app.use(/^(?!\/api\/).*/, async (req, res, next) => {
    try {
      const indexHtmlPath = resolve(clientRoot, "index.html");
      let template = await fs.promises.readFile(indexHtmlPath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return vite;
}


export function serveStatic(app: Express) {
  if (!fs.existsSync(clientDist)) {
    throw new Error(
      `Could not find client build directory: ${clientDist}. Run 'npm run build' first.`
    );
  }

  app.use(express.static(clientDist));

  app.use(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(resolve(clientDist, "index.html"));
  });
}
