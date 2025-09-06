import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertContactSchema } from "../shared/schema.js";
import { z } from "zod";

function pickOg(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1] : undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/github/repos", async (_req: Request, res: Response) => {
    try {
      const githubUsername = process.env.GITHUB_USERNAME || "halimcho";
      const githubToken = process.env.GITHUB_TOKEN;

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Website",
      };
      if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;


      const response = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }

      const repos = (await response.json()) as any[];

      await storage.clearGitHubRepos();
      const storedRepos = await Promise.all(
        repos.map((repo) =>
          storage.createGitHubRepo({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
          })
        )
      );

      res.json(storedRepos);
    } catch (error) {
      console.error("GitHub API error:", error);
      res.status(500).json({
        message: "Failed to fetch GitHub repositories",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });


  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json({
        message: "Contact form submitted successfully",
        contact: { id: contact.id },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          message: "Failed to submit contact form",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });


  app.get("/api/kakao/location", async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.query as { lat?: string; lng?: string };
      const kakaoApiKey = process.env.KAKAO_API_KEY;

      if (!lat || !lng) {
        return res
          .status(400)
          .json({ message: "Latitude(lat) and longitude(lng) are required" });
      }
      if (!kakaoApiKey) {
        return res
          .status(500)
          .json({ message: "KAKAO_API_KEY is not configured in environment" });
      }

      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(
          lng
        )}&y=${encodeURIComponent(lat)}`,
        {
          headers: {
            Authorization: `KakaoAK ${kakaoApiKey}`,
            "Content-Type": "application/json",
          } as Record<string, string>,
        }
      );

      if (!response.ok) {
        throw new Error(`Kakao API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as unknown;
      res.json(data);
    } catch (error) {
      console.error("Kakao API error:", error);
      res.status(500).json({
        message: "Failed to get location information",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/place-preview", async (req: Request, res: Response) => {
    try {
      const url = String(req.query.url || "");
      if (!url) return res.status(400).json({ error: "url query is required" });

      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!resp.ok) {
        return res
          .status(502)
          .json({ error: `failed to fetch (${resp.status})` });
      }
      const html = await resp.text();

      const payload = {
        title: pickOg(html, "og:title"),
        description: pickOg(html, "og:description"),
        image: pickOg(html, "og:image"),
      };

      res.json(payload);
    } catch (e) {
      console.error("preview error:", e);
      res.status(500).json({ error: "preview failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
