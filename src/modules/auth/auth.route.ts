import { Router } from "express";
import { csrfMiddleware } from "@/middlewares/csrf.middleware.js";
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
authRouter.post("/login", validate(loginUserSchema), loginUserController);
authRouter.post("/logout", csrfMiddleware, logoutUserController);
authRouter.post("/refresh", refreshTokenController);
authRouter.get("/csrf", csrfMiddleware, getCsrfTokenController);
