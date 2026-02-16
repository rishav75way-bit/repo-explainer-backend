import { Octokit } from "octokit";
import { env } from "../../common/config/index.js";
import { Repository } from "./repository.model.js";
import type { CreateRepositoryInput } from "./repository.validators.js";

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

function parseRepoFromUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\/|\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function fetchRepoMetadata(repoUrl: string) {
  const parsed = parseRepoFromUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL");
  }
  const { data } = await octokit.rest.repos.get(parsed);
  return {
    fullName: data.full_name ?? `${parsed.owner}/${parsed.repo}`,
    defaultBranch: data.default_branch ?? "main",
    languagesUrl: data.languages_url,
    contentsUrl: data.contents_url?.replace("{+path}", ""),
  };
}

export async function fetchRepoTree(owner: string, repo: string, branch: string) {
  const { data } = await octokit.rest.repos.getBranch({ owner, repo, branch });
  const sha = data.commit.sha;
  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: sha,
    recursive: "true",
  });
  return tree.tree
    .filter((n): n is { path: string; type: string } => "path" in n && !!n.path)
    .map((n) => ({ path: n.path, type: n.type }));
}

export async function fetchRepoLanguages(owner: string, repo: string) {
  const { data } = await octokit.rest.repos.listLanguages({ owner, repo });
  return data;
}

export async function fetchRepoContents(
  owner: string,
  repo: string,
  path: string,
  ref?: string
) {
  const params = { owner, repo, path, ...(ref ? { ref } : {}) };
  const { data } = await octokit.rest.repos.getContent(params);
  return data;
}

export async function createRepository(
  userId: string,
  input: CreateRepositoryInput
) {
  const metadata = await fetchRepoMetadata(input.repoUrl);
  const [owner, repoName] = metadata.fullName.split("/");
  const tree = await fetchRepoTree(owner, repoName, metadata.defaultBranch);
  const languages = await fetchRepoLanguages(owner, repoName);

  const existing = await Repository.findOne({
    userId,
    repoUrl: input.repoUrl,
  });

  if (existing) {
    return {
      repository: existing,
      metadata: {
        fileTree: tree.slice(0, 200),
        languages: Object.keys(languages),
        defaultBranch: metadata.defaultBranch,
      },
    };
  }

  const repository = await Repository.create({
    userId,
    repoUrl: input.repoUrl,
    repoName: metadata.fullName,
    analyzedAt: null,
  });

  return {
    repository: {
      _id: repository._id,
      userId: repository.userId,
      repoUrl: repository.repoUrl,
      repoName: repository.repoName,
      analyzedAt: repository.analyzedAt,
    },
    metadata: {
      fileTree: tree.slice(0, 200),
      languages: Object.keys(languages),
      defaultBranch: metadata.defaultBranch,
    },
  };
}

export async function getRepositoryById(repositoryId: string, userId: string) {
  const repo = await Repository.findOne({
    _id: repositoryId,
    userId,
  });
  if (!repo) {
    throw new Error("Repository not found");
  }
  return repo;
}

export async function listUserRepositories(userId: string) {
  const repos = await Repository.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return repos;
}
