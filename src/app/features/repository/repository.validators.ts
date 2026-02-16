import { z } from "zod";

const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export const createRepositorySchema = z.object({
  repoUrl: z
    .string()
    .url()
    .refine((val) => GITHUB_REPO_REGEX.test(val), {
      message: "Must be a valid GitHub repository URL",
    }),
});

export const getRepositoryParamsSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/, "Invalid repository ID"),
});

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;
export type GetRepositoryParams = z.infer<typeof getRepositoryParamsSchema>;
