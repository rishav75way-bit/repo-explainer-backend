import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../common/helpers/api-response.js";
import { HTTP_STATUS } from "../../common/constants/http.js";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, user, HTTP_STATUS.CREATED);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    sendError(res, msg, msg === "Email already registered" ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    sendError(res, msg === "Invalid credentials" ? "Invalid credentials" : msg, HTTP_STATUS.UNAUTHORIZED);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refresh failed";
    sendError(res, msg, HTTP_STATUS.UNAUTHORIZED);
  }
}
