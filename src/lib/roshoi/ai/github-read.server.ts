type GitHubRepo = "HDmaster" | "roshoi-customers--orders-" | "Roshoi-partners" | "roshoi-riders" | "Apps-integration-";

type GitHubConfig = { token: string; owner: string };

function config(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim() || "Foodpalace";
  if (!token) throw new Error("GITHUB_TOKEN is not configured for Master AI engineering tools");
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(owner)) throw new Error("Invalid GITHUB_OWNER");
  return { token, owner };
}

function repoName(repo: unknown): GitHubRepo {
  const value = typeof repo === "string" ? repo : "HDmaster";
  const allowed: GitHubRepo[] = ["HDmaster", "roshoi-customers--orders-", "Roshoi-partners", "roshoi-riders", "Apps-integration-"];
  if (!allowed.includes(value as GitHubRepo)) throw new Error("Repository is outside the Order King allowlist");
  return value as GitHubRepo;
}

async function github(path: string) {
  const { token } = config();
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Order-King-Master-AI",
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${JSON.stringify(body).slice(0, 1000)}`);
  return body as Record<string, unknown>;
}

function safePath(path: unknown) {
  if (typeof path !== "string" || !path.trim()) throw new Error("File path is required");
  const normalized = path.trim().replace(/^\/+/, "");
  if (normalized.includes("..")) throw new Error("Parent-path traversal is not allowed");
  return normalized.split("/").map(encodeURIComponent).join("/");
}

export async function getRepositoryStatus(repo: unknown) {
  const { owner } = config();
  const data = await github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName(repo))}`);
  return {
    name: data.name,
    fullName: data.full_name,
    private: data.private,
    defaultBranch: data.default_branch,
    archived: data.archived,
    pushedAt: data.pushed_at,
    openIssues: data.open_issues_count,
    visibility: data.visibility,
  };
}

export async function getRecentCommits(repo: unknown, limit = 10) {
  const { owner } = config();
  const bounded = Math.min(20, Math.max(1, Math.floor(limit)));
  const data = await github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName(repo))}/commits?per_page=${bounded}`);
  return Array.isArray(data) ? data.map((item) => ({
    sha: item.sha,
    message: (item.commit as Record<string, unknown> | undefined)?.message,
    author: ((item.commit as Record<string, unknown> | undefined)?.author as Record<string, unknown> | undefined)?.name,
    date: ((item.commit as Record<string, unknown> | undefined)?.author as Record<string, unknown> | undefined)?.date,
    url: item.html_url,
  })) : [];
}

export async function inspectFile(repo: unknown, path: unknown, ref?: unknown) {
  const { owner } = config();
  const encodedPath = safePath(path);
  const refQuery = typeof ref === "string" && ref.trim() ? `?ref=${encodeURIComponent(ref.trim())}` : "";
  const data = await github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName(repo))}/contents/${encodedPath}${refQuery}`);
  if (data.type !== "file" || typeof data.content !== "string") throw new Error("GitHub path is not a text file");
  const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { repo: repoName(repo), path: data.path, sha: data.sha, size: data.size, content: content.slice(0, 40_000) };
}

export async function searchCode(query: unknown, repo?: unknown) {
  if (typeof query !== "string" || !query.trim()) throw new Error("Code search query is required");
  const { owner } = config();
  const repository = repo ? repoName(repo) : null;
  const qualifiers = `${query.trim()}${repository ? ` repo:${owner}/${repository}` : ` org:${owner}`}`;
  const data = await github(`/search/code?q=${encodeURIComponent(qualifiers)}&per_page=20`);
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((item) => ({ name: item.name, path: item.path, repo: (item.repository as Record<string, unknown> | undefined)?.full_name, url: item.html_url, sha: item.sha }));
}

export async function inspectCi(repo: unknown, runId?: unknown) {
  const { owner } = config();
  const repository = repoName(repo);
  if (runId != null && String(runId).trim()) {
    const jobs = await github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/runs/${encodeURIComponent(String(runId))}/jobs?per_page=100`);
    const items = Array.isArray(jobs.jobs) ? jobs.jobs : [];
    return { runId: String(runId), jobs: items.map((job) => ({ id: job.id, name: job.name, status: job.status, conclusion: job.conclusion, startedAt: job.started_at, completedAt: job.completed_at })) };
  }
  const runs = await github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/runs?per_page=10`);
  const items = Array.isArray(runs.workflow_runs) ? runs.workflow_runs : [];
  return items.map((run) => ({ id: run.id, name: run.name, status: run.status, conclusion: run.conclusion, headSha: run.head_sha, branch: run.head_branch, createdAt: run.created_at, updatedAt: run.updated_at, url: run.html_url }));
}
