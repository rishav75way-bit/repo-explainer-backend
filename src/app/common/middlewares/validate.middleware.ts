import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../helpers/api-response.js";
import { HTTP_STATUS } from "../constants/http.js";

type ValidationTarget = "body" | "query" | "params" | "headers";

export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[target];
    const result = schema.safeParse(data);

    if (result.success) {
      req[target] = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.entries(errors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("; ");
      sendError(res, message, HTTP_STATUS.BAD_REQUEST);
    }
  };
}
