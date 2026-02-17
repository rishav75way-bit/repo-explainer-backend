import { z } from "zod";

export const runAnalysisParamsSchema = z.object({
  repositoryId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid repository ID"),
});

const LANGUAGE_CODES = ["en", "hi", "hry", "bho", "es", "fr", "de", "pt", "ja"] as const;

export const runAnalysisBodySchema = z.object({
  language: z.enum(LANGUAGE_CODES).optional(),
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

export const askQuestionBodySchema = z.object({
  question: z.string().min(1, "Question is required").max(2000, "Question too long"),
});

export type RunAnalysisParams = z.infer<typeof runAnalysisParamsSchema>;
export type AnalysisIdParams = z.infer<typeof analysisIdParamsSchema>;
export type ShareTokenParams = z.infer<typeof shareTokenParamsSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type AskQuestionInput = z.infer<typeof askQuestionBodySchema>;
