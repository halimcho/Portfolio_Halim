import { useQuery } from "@tanstack/react-query";

type Repo = {
  id: number | string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count?: number | null;
  forks_count?: number | null;
  stars?: number | null;  
  forks?: number | null; 
  topics?: string[];
  updated_at?: string | null;
  pushed_at?: string | null;
  html_url: string;
};

export function useGitHubRepos() {
  return useQuery<Repo[]>({
    queryKey: ["/api/github/repos"],
    queryFn: async () => {
      try {
        const r = await fetch("/api/github/repos", { credentials: "omit" });
        if (r.ok) return (await r.json()) as Repo[];
      } catch {
      }

      const username = import.meta.env.VITE_GITHUB_USERNAME || "hcho0511";
      const r2 = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=12&sort=updated`
      );
      if (!r2.ok) throw new Error("GitHub API request failed");
      const raw = (await r2.json()) as any[];
      return raw.map((x) => ({
        id: x.id,
        name: x.name,
        description: x.description,
        language: x.language,
        stargazers_count: x.stargazers_count,
        forks_count: x.forks_count,
        topics: x.topics ?? [],
        updated_at: x.updated_at,
        pushed_at: x.pushed_at,
        html_url: x.html_url,
      })) as Repo[];
    },
    staleTime: 1000 * 60, 
  });
}
