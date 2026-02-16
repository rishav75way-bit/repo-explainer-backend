import { Router } from "express";
import { authRoutes } from "../features/auth/auth.routes.js";
import { repositoryRoutes } from "../features/repository/repository.routes.js";
import { analysisRoutes } from "../features/analysis/analysis.routes.js";
import { sendSuccess } from "../common/helpers/api-response.js";

const router = Router();

router.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/analysis", analysisRoutes);

export const appRouter = router;
