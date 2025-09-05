import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const githubUsername = process.env.GITHUB_USERNAME || "halimcho";
    const githubToken = process.env.GITHUB_TOKEN;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Website'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }
    
    const repos = await response.json();
    
    const transformedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
      html_url: repo.html_url
    }));
    
    res.json(transformedRepos);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ 
      message: "Failed to fetch GitHub repositories",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}