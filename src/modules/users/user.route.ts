import { Router } from "express";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";
import { getMeController } from "@/modules/users/user.controller.js";

export const userRouter = Router();

userRouter.get("/me", authenticationMiddleware, getMeController);
