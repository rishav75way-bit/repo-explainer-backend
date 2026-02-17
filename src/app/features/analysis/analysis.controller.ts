import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../common/helpers/api-response.js";
import { HTTP_STATUS } from "../../common/constants/http.js";
import { env } from "../../common/config/index.js";
import * as analysisService from "./analysis.service.js";

function normalizeAnalysisError(rawMessage: string): string {
  const msg = rawMessage.trim();
  const isQuota = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded");
  if (isQuota) {
    return "Gemini limit reached ";
  }
  if (msg.length > 120 || msg.startsWith("{")) {
    return env.NODE_ENV === "development" && msg.length < 300 ? msg : "Analysis failed. Please try again.";
  }
  return msg;
}

export async function runAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { repositoryId } = req.params;
    const { language } = req.body ?? {};
    const analysis = await analysisService.runAnalysis(repositoryId, userId, { language });
    sendSuccess(res, analysis, HTTP_STATUS.CREATED);
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Analysis failed";
    const msg = normalizeAnalysisError(raw);
    const status = msg.includes("not found") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function getAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { repositoryId } = req.params;
    const analysis = await analysisService.getAnalysisByRepositoryId(repositoryId, userId);
    sendSuccess(res, analysis);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis not found";
    sendError(res, msg, HTTP_STATUS.NOT_FOUND);
  }
}

export async function listAnalyses(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { repositoryId } = req.params;
    const analyses = await analysisService.listAnalysesByRepositoryId(repositoryId, userId);
    sendSuccess(res, analyses);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list analyses";
    sendError(res, msg, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function deleteAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { id } = req.params;
    await analysisService.deleteAnalysis(id, userId);
    sendSuccess(res, { message: "Analysis deleted" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete analysis";
    const status = msg.includes("not found") || msg.includes("Unauthorized") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function createShareLink(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const shareToken = await analysisService.generateShareToken(id, userId, isPublic ?? true);
    sendSuccess(res, { shareToken, shareUrl: `/share/${shareToken}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create share link";
    const status = msg.includes("not found") || msg.includes("Unauthorized") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function revokeShareLink(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { id } = req.params;
    await analysisService.revokeShareToken(id, userId);
    sendSuccess(res, { message: "Share link revoked" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to revoke share link";
    const status = msg.includes("not found") || msg.includes("Unauthorized") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function askQuestion(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { id } = req.params;
    const { question } = req.body;
    const answer = await analysisService.askQuestion(id, userId, question);
    sendSuccess(res, { answer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to get answer";
    const status = msg.includes("not found") || msg.includes("Unauthorized") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function getSharedAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;
    const analysis = await analysisService.getAnalysisByShareToken(token);
    sendSuccess(res, analysis);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis not found";
    sendError(res, msg, HTTP_STATUS.NOT_FOUND);
  }
}
