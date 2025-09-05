import {
  ExternalLink,
  Star,
  GitBranch,
  Github,
  Loader2,
} from "lucide-react";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { Button } from "./button";

type Lang = "ko" | "en";

const T = {
  ko: {
    title: "Latest Projects",
    subtitle: "GitHub에서 가져온 최신 프로젝트들입니다",
    loading: "GitHub 저장소를 불러오는 중...",
    error: "GitHub 저장소를 불러오지 못했습니다",
    errorHelp: "GitHub API 토큰이 올바르게 설정되었는지 확인하세요.",
    empty: "저장소가 없습니다.",
    updated: "업데이트",
    noDesc: "설명이 없습니다.",
    view: "보기",
    viewAll: "GitHub에서 모두 보기",
  },
  en: {
    title: "Latest Projects",
    subtitle: "These are the latest projects fetched from GitHub",
    loading: "Loading GitHub repositories...",
    error: "Failed to load GitHub repositories",
    errorHelp: "Please check if the GitHub API token is configured correctly.",
    empty: "No repositories found.",
    updated: "Updated",
    noDesc: "No description available.",
    view: "View",
    viewAll: "View All on GitHub",
  },
};

const formatNumber = (num: number): string => {
  if (typeof num !== "number") return "0";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
};

const languageColors: Record<string, string> = {
  JavaScript: "bg-yellow-500/20 text-yellow-400",
  TypeScript: "bg-blue-500/20 text-blue-400",
  Python: "bg-green-500/20 text-green-400",
  Java: "bg-red-500/20 text-red-400",
  HTML: "bg-orange-500/20 text-orange-400",
  CSS: "bg-purple-500/20 text-purple-400",
};

export default function ProjectsSection({ language = "ko" }: { language?: Lang }) {
  const query = useGitHubRepos();
  const repos = query.data ?? []; 
  const L = T[language];

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{L.title}</h2>
          <p className="text-gray-700 dark:text-slate-300 mb-6">{L.subtitle}</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {query.isLoading && (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="flex items-center space-x-3 text-gray-700 dark:text-slate-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">{L.loading}</span>
              </div>
            </div>
          )}

          {query.isError && (
            <div className="col-span-full text-center py-20">
              <div className="text-red-500 mb-4">
                {L.error}: {(query.error as Error)?.message}
              </div>
              <p className="text-gray-700 dark:text-slate-300">{L.errorHelp}</p>
            </div>
          )}

          {!query.isLoading && !query.isError && repos.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-gray-700 dark:text-slate-300">{L.empty}</div>
            </div>
          )}

          {repos.map((repo) => {
            const stars =
              (repo as any).stargazers_count ?? (repo as any).stars ?? 0;
            const forks = (repo as any).forks_count ?? (repo as any).forks ?? 0;
            const topics: string[] = (repo as any).topics ?? [];
            const dateStr =
              (repo as any).updated_at ?? (repo as any).pushed_at ?? null;

            return (
              <div
                key={repo.id as any}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-transform transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {repo.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-slate-300 text-sm">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {formatNumber(stars)}
                    </span>
                    <span className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-1" />
                      {formatNumber(forks)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">
                  {repo.description ?? L.noDesc}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {repo.language && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          languageColors[repo.language] ||
                          "bg-slate-600/20 text-slate-300"
                        }`}
                      >
                        {repo.language}
                      </span>
                    )}
                    {topics.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-slate-200/70 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 rounded text-xs"
                      >
                        #{t}
                      </span>
                    ))}
                    {dateStr && (
                      <span className="text-gray-700 dark:text-slate-300 text-xs">
                        {L.updated}{" "}
                        {new Date(dateStr).toLocaleDateString(
                          language === "ko" ? "ko-KR" : "en-US"
                        )}
                      </span>
                    )}
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {L.view}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 font-medium transition-colors"
          >
            <a
              href={`https://github.com/${
                import.meta.env.VITE_GITHUB_USERNAME || "hcho0511"
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Github className="mr-2 h-4 w-4" />
              {T[language].viewAll}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
