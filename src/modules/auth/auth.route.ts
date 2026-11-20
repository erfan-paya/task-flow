import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware.js";
import { loginUserController, registerUserController } from "@/modules/auth/auth.controller.js";
import { loginUserSchema, registerUserSchema } from "@/modules/users/user.validation.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerUserSchema), registerUserController);
authRouter.post("/login", validate(loginUserSchema), loginUserController);
