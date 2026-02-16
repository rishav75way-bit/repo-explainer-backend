import type { Response } from "express";
import { HTTP_STATUS } from "../constants/http.js";

export function sendSuccess<T>(
  res: Response,
  data: T,
  status: number = HTTP_STATUS.OK
): void {
  res.status(status).json({ success: true, data });
}

export function sendError(
  res: Response,
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST
): void {
  res.status(status).json({ success: false, error: message });
}
