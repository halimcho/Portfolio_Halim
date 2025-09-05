import { Router } from "express";
import fetch from "node-fetch";

const router = Router();


router.get("/repos", async (req, res) => {
  try {
    const user = String(req.query.user || "").trim();
    if (!user) return res.status(400).json({ error: "missing user" });

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const gh = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!gh.ok) {
      const text = await gh.text();
      return res.status(gh.status).send(text);
    }

    const data = await gh.json();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "github proxy failed" });
  }
});

export default router;
