import { Router } from "express";
import { validate } from "../../common/middlewares/index.js";
import { registerSchema, loginSchema, refreshSchema } from "./auth.validators.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

export const authRoutes = router;
