import { z } from "zod";

export const runAnalysisParamsSchema = z.object({
  repositoryId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid repository ID"),
});

export const analysisIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/, "Invalid analysis ID"),
});

export const shareTokenParamsSchema = z.object({
  token: z.string().min(1),
});

export const createShareLinkSchema = z.object({
  isPublic: z.boolean().optional(),
});

export type RunAnalysisParams = z.infer<typeof runAnalysisParamsSchema>;
export type AnalysisIdParams = z.infer<typeof analysisIdParamsSchema>;
export type ShareTokenParams = z.infer<typeof shareTokenParamsSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
