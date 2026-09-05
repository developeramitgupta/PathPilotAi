import "server-only";

import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { githubAnalyses } from "@/lib/db/schema";

const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

type GitHubUser = {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
  avatar_url: string;
  created_at: string;
};
type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  updated_at: string;
};

export type GitHubAnalysisResult = {
  username: string;
  profileUrl: string;
  avatarUrl: string;
  score: number;
  summary: string;
  evidence: {
    publicRepositories: number;
    activeOriginalRepositories: number;
    followers: number;
    stars: number;
    hasBio: boolean;
    languages: Record<string, number>;
  };
  repositories: Array<{
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    updatedAt: string;
  }>;
  sourceUrl: string;
  retrievedAt: string;
};

function githubHeaders() {
  const token = process.env.GITHUB_PUBLIC_API_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (response.status === 404) throw new Error("GITHUB_PROFILE_NOT_FOUND");
  if (response.status === 403 || response.status === 429) throw new Error("GITHUB_RATE_LIMITED");
  if (!response.ok) throw new Error(`GITHUB_HTTP_${response.status}`);
  return (await response.json()) as T;
}

export async function analysePublicGitHubProfile(usernameInput: string): Promise<GitHubAnalysisResult> {
  const username = usernameInput.trim();
  if (!GITHUB_USERNAME.test(username)) throw new Error("INVALID_GITHUB_USERNAME");
  const encoded = encodeURIComponent(username);
  const [user, repos] = await Promise.all([
    githubJson<GitHubUser>(`/users/${encoded}`),
    githubJson<GitHubRepo[]>(`/users/${encoded}/repos?per_page=100&sort=updated&type=owner`),
  ]);

  const original = repos.filter((repo) => !repo.fork && !repo.archived);
  const languages = original.reduce<Record<string, number>>((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] ?? 0) + 1;
    return acc;
  }, {});
  const stars = original.reduce((total, repo) => total + repo.stargazers_count, 0);
  const active = original.filter(
    (repo) => Date.now() - Date.parse(repo.updated_at) < 365 * 24 * 60 * 60 * 1000,
  ).length;
  const score = Math.min(
    100,
    (user.bio ? 10 : 0) +
      Math.min(30, original.length * 4) +
      Math.min(25, active * 5) +
      Math.min(20, Object.keys(languages).length * 5) +
      Math.min(15, Math.log2(stars + 1) * 4),
  );
  const roundedScore = Math.round(score);
  const languageList = Object.keys(languages).slice(0, 3).join(", ") || "no detected languages";
  const summary = `${original.length} original public repositories, ${active} updated in the last year, with ${languageList}. This score reflects only visible GitHub evidence, not employability or private work.`;

  return {
    username: user.login,
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    score: roundedScore,
    summary,
    evidence: {
      publicRepositories: user.public_repos,
      activeOriginalRepositories: active,
      followers: user.followers,
      stars,
      hasBio: Boolean(user.bio),
      languages,
    },
    repositories: original.slice(0, 6).map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    })),
    sourceUrl: user.html_url,
    retrievedAt: new Date().toISOString(),
  };
}

export async function saveGitHubAnalysis(userId: string, result: GitHubAnalysisResult) {
  const database = getDb();
  await database.insert(githubAnalyses).values({
    id: randomUUID(),
    userId,
    username: result.username,
    score: result.score,
    languages: result.evidence.languages,
    summary: result.summary,
    createdAt: new Date(result.retrievedAt),
  });
}

export async function getLatestGitHubAnalysis(userId: string) {
  const [analysis] = await getDb()
    .select()
    .from(githubAnalyses)
    .where(eq(githubAnalyses.userId, userId))
    .orderBy(desc(githubAnalyses.createdAt))
    .limit(1);
  return analysis ?? null;
}
