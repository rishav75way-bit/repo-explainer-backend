import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tokenPayload?: JwtPayload & { sub: string };
    }
  }
}

export {};
