import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../common/helpers/api-response.js";
import { HTTP_STATUS } from "../../common/constants/http.js";
import * as repositoryService from "./repository.service.js";

export async function createRepository(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const result = await repositoryService.createRepository(userId, req.body);
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to add repository";
    const status = msg.includes("Invalid") || msg.includes("not found") ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    sendError(res, msg, status);
  }
}

export async function getRepository(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const { id } = req.params;
    const repo = await repositoryService.getRepositoryById(id, userId);
    sendSuccess(res, repo);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Repository not found";
    sendError(res, msg, HTTP_STATUS.NOT_FOUND);
  }
}

export async function listRepositories(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  try {
    const repos = await repositoryService.listUserRepositories(userId);
    sendSuccess(res, repos);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list repositories";
    sendError(res, msg, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
