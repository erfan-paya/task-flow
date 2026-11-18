import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware.js";
import { registerUserController } from "@/modules/auth/auth.controller.js";
import { registerUserSchema } from "@/modules/users/user.validation.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerUserSchema), registerUserController);
