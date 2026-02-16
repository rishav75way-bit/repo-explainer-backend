import { Router } from "express";
import { authMiddleware, validate } from "../../common/middlewares/index.js";
import { createRepositorySchema, getRepositoryParamsSchema } from "./repository.validators.js";
import * as repositoryController from "./repository.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", repositoryController.listRepositories);
router.post(
  "/",
  validate(createRepositorySchema),
  repositoryController.createRepository
);
router.get(
  "/:id",
  validate(getRepositoryParamsSchema, "params"),
  repositoryController.getRepository
);

export const repositoryRoutes = router;
