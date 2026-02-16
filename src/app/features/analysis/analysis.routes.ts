import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, validate } from "../../common/middlewares/index.js";
import {
  runAnalysisParamsSchema,
  analysisIdParamsSchema,
  shareTokenParamsSchema,
  createShareLinkSchema,
} from "./analysis.validators.js";
import * as analysisController from "./analysis.controller.js";
import {
  ANALYSIS_RATE_LIMIT_WINDOW_MS,
  ANALYSIS_RATE_LIMIT_MAX,
} from "../../common/constants/rate-limit.js";

const router = Router();

const analysisLimiter = rateLimit({
  windowMs: ANALYSIS_RATE_LIMIT_WINDOW_MS,
  max: ANALYSIS_RATE_LIMIT_MAX,
  message: { success: false, error: "Too many analysis requests" },
});

router.get(
  "/share/:token",
  validate(shareTokenParamsSchema, "params"),
  analysisController.getSharedAnalysis
);

router.use(authMiddleware);

router.post(
  "/:repositoryId",
  analysisLimiter,
  validate(runAnalysisParamsSchema, "params"),
  analysisController.runAnalysis
);
router.get(
  "/:repositoryId",
  validate(runAnalysisParamsSchema, "params"),
  analysisController.getAnalysis
);
router.get(
  "/:repositoryId/history",
  validate(runAnalysisParamsSchema, "params"),
  analysisController.listAnalyses
);
router.delete(
  "/:id",
  validate(analysisIdParamsSchema, "params"),
  analysisController.deleteAnalysis
);
router.post(
  "/:id/share",
  validate(analysisIdParamsSchema, "params"),
  validate(createShareLinkSchema),
  analysisController.createShareLink
);
router.delete(
  "/:id/share",
  validate(analysisIdParamsSchema, "params"),
  analysisController.revokeShareLink
);

export const analysisRoutes = router;
