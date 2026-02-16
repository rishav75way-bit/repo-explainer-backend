import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { sendError } from "../helpers/api-response.js";
import { HTTP_STATUS } from "../constants/http.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    sendError(res, "Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { sub: string };
    req.userId = payload.sub;
    req.tokenPayload = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token", HTTP_STATUS.UNAUTHORIZED);
  }
}
