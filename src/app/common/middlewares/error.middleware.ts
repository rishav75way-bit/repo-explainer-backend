import type { Request, Response, NextFunction } from "express";
import { env } from "../config/index.js";
import { sendError } from "../helpers/api-response.js";
import { HTTP_STATUS } from "../constants/http.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message;
  sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
