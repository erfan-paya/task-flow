import { Router } from "express";
import { csrfMiddleware } from "@/middlewares/csrf.middleware.js";
import { loginRateLimitMiddleware } from "@/middlewares/login-rate-limit.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import {
    getCsrfTokenController,
    loginUserController,
    logoutUserController,
    refreshTokenController,
    registerUserController,
} from "@/modules/auth/auth.controller.js";
import { loginUserSchema, registerUserSchema } from "@/modules/users/user.validation.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerUserSchema), registerUserController);
authRouter.post("/login", loginRateLimitMiddleware, validate(loginUserSchema), loginUserController);
authRouter.post("/logout", csrfMiddleware, logoutUserController);
authRouter.post("/refresh", csrfMiddleware, refreshTokenController);
authRouter.get("/csrf", getCsrfTokenController);
