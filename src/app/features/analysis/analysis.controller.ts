import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../common/helpers/api-response.js";
import { HTTP_STATUS } from "../../common/constants/http.js";
import * as analysisService from "./analysis.service.js";

export async function runAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { repositoryId } = req.params;
    const analysis = await analysisService.runAnalysis(repositoryId, userId);
    sendSuccess(res, analysis, HTTP_STATUS.CREATED);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis failed";
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
