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
  /**
   * GitHub 최신 저장소 6개 가져오기
   * - 토큰 있으면: /user/repos (private 포함) → owner=targetUser만 필터
   * - 없거나 실패: /users/:username/repos (public만)
   */
  app.get("/api/github/repos", async (req: Request, res: Response) => {
    try {
      const usernameFromQuery = (req.query.username as string | undefined)?.trim();
      const envUsername = (process.env.GITHUB_USERNAME || "halimcho").trim();
      const targetUser = (usernameFromQuery || envUsername).trim();
      const token = process.env.GITHUB_TOKEN;

      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Portfolio-Website",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      let repos: any[] = [];

      // 1) 인증 사용자 저장소 (private 포함)
      if (token) {
        const authedUrl =
          "https://api.github.com/user/repos?affiliation=owner&visibility=all&sort=updated&per_page=100";
        const r = await fetch(authedUrl, { headers });
        if (r.ok) {
          const all = (await r.json()) as any[];
          repos = all
            .filter(
              (it) => it?.owner?.login?.toLowerCase() === targetUser.toLowerCase()
            )
            .sort(
              (a, b) =>
                +new Date(b?.updated_at ?? 0) - +new Date(a?.updated_at ?? 0)
            )
            .slice(0, 6);
        } else {
          console.warn(
            "[github] /user/repos failed → fallback",
            r.status,
            await r.text()
          );
        }
      }

      // 2) 폴백: 공개 저장소만
      if (repos.length === 0) {
        const publicUrl = `https://api.github.com/users/${encodeURIComponent(
          targetUser
        )}/repos?sort=updated&type=owner&per_page=6`;
        const pub = await fetch(publicUrl, { headers });
        if (!pub.ok) {
          return res.status(pub.status).json({
            error: "github_api_error",
            status: pub.status,
            body: await pub.text(),
          });
        }
        repos = (await pub.json()) as any[];
      }

      // (선택) DB 저장 로직 유지
      await storage.clearGitHubRepos();
      const stored = await Promise.all(
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

      res.json(stored);
    } catch (error) {
      console.error("GitHub API error:", error);
      res.status(500).json({
        error: "internal_error",
        message:
          error instanceof Error ? error.message : "Failed to fetch repositories",
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
        const text = await response.text();
        throw new Error(
          `Kakao API responded with status: ${response.status} body: ${text}`
        );
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
