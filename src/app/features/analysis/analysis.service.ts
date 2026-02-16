import { GoogleGenAI } from "@google/genai";
import { env } from "../../common/config/index.js";
import { Repository } from "../repository/repository.model.js";
import { Analysis } from "./analysis.model.js";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchRepoLanguages,
  fetchRepoContents,
} from "../repository/repository.service.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const AI_OUTPUT_SCHEMA = `{
  "summary": "string - non-technical project summary",
  "technicalOverview": "string - tech stack and architecture overview",
  "architectureExplanation": "string - structure and patterns",
  "featureBreakdown": "string - main features listed",
  "scalabilityNotes": "string - scalability considerations",
  "risks": "string - risks and improvements",
  "portfolioDescription": "string - portfolio-ready description"
}`;

async function getPackageJsonContent(owner: string, repo: string, ref: string) {
  try {
    const data = await fetchRepoContents(owner, repo, "package.json", ref);
    if (Array.isArray(data)) return null;
    if (data.type !== "file" || !("content" in data) || !data.content) return null;
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return decoded;
  } catch {
    return null;
  }
}

function buildFileTreeSummary(tree: Array<{ path: string; type: string }>): string {
  const maxEntries = 150;
  const entries = tree.slice(0, maxEntries);
  return entries.map((e) => `${e.type === "tree" ? "[dir]" : "[file]"} ${e.path}`).join("\n");
}

function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return "{}";
  return trimmed.slice(jsonStart, jsonEnd + 1);
}

export async function runAnalysis(repositoryId: string, userId: string) {
  const repository = await Repository.findOne({ _id: repositoryId, userId });
  if (!repository) {
    throw new Error("Repository not found");
  }

  const metadata = await fetchRepoMetadata(repository.repoUrl);
  const [owner, repoName] = metadata.fullName.split("/");
  const tree = await fetchRepoTree(owner, repoName, metadata.defaultBranch);
  const languages = await fetchRepoLanguages(owner, repoName);
  const packageJsonContent = await getPackageJsonContent(owner, repoName, metadata.defaultBranch);

  const fileTreeSummary = buildFileTreeSummary(tree);
  const languagesList = Object.keys(languages).join(", ");
  const repoStats = `Languages: ${languagesList}\nTotal files in tree: ${tree.length}`;

  const prompt = `Analyze this GitHub repository and return ONLY valid JSON matching this schema. No markdown, no extra text.
Schema: ${AI_OUTPUT_SCHEMA}

Repository: ${metadata.fullName}
Default branch: ${metadata.defaultBranch}

File tree (sample):
${fileTreeSummary}

Repo stats:
${repoStats}

package.json content:
${packageJsonContent ?? "Not found or not applicable"}

Generate structured analysis. Return ONLY the JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawText = response.text ?? "";
  const jsonStr = extractJsonFromText(rawText);
  let parsed: Record<string, string>;

  try {
    parsed = JSON.parse(jsonStr) as Record<string, string>;
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const required = [
    "summary",
    "technicalOverview",
    "architectureExplanation",
    "featureBreakdown",
    "scalabilityNotes",
    "risks",
    "portfolioDescription",
  ] as const;

  const structuredResult: Record<string, string> = {};
  for (const key of required) {
    structuredResult[key] =
      typeof parsed[key] === "string" ? parsed[key] : String(parsed[key] ?? "");
  }

  const analysis = await Analysis.create({
    repositoryId,
    structuredResult,
  });

  await Repository.updateOne(
    { _id: repositoryId },
    { $set: { analyzedAt: new Date() } }
  );

  return analysis;
}

export async function getAnalysisByRepositoryId(repositoryId: string, userId: string) {
  const repo = await Repository.findOne({ _id: repositoryId, userId });
  if (!repo) {
    throw new Error("Repository not found");
  }

  const analysis = await Analysis.findOne({ repositoryId })
    .sort({ createdAt: -1 })
    .lean();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  return analysis;
}

export async function listAnalysesByRepositoryId(repositoryId: string, userId: string) {
  const repo = await Repository.findOne({ _id: repositoryId, userId });
  if (!repo) {
    throw new Error("Repository not found");
  }

  const analyses = await Analysis.find({ repositoryId })
    .sort({ createdAt: -1 })
    .lean();

  return analyses;
}

export async function deleteAnalysis(analysisId: string, userId: string) {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const repo = await Repository.findById(analysis.repositoryId);
  if (!repo || repo.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await Analysis.deleteOne({ _id: analysisId });
}

export async function generateShareToken(analysisId: string, userId: string, isPublic: boolean) {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const repo = await Repository.findById(analysis.repositoryId);
  if (!repo || repo.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  const crypto = await import("crypto");
  const shareToken = crypto.randomBytes(32).toString("hex");

  await Analysis.updateOne(
    { _id: analysisId },
    { $set: { shareToken, isPublic } }
  );

  return shareToken;
}

export async function getAnalysisByShareToken(shareToken: string) {
  const analysis = await Analysis.findOne({ shareToken, isPublic: true }).lean();
  if (!analysis) {
    throw new Error("Analysis not found or not public");
  }
  return analysis;
}

export async function revokeShareToken(analysisId: string, userId: string) {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const repo = await Repository.findById(analysis.repositoryId);
  if (!repo || repo.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await Analysis.updateOne(
    { _id: analysisId },
    { $unset: { shareToken: "", isPublic: "" } }
  );
}
