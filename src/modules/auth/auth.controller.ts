import type { Response } from "express";

import type { ValidatedRequest } from "@/middlewares/validate.middleware.js";
import { loginUserService, registerUserService } from "@/modules/auth/auth.service.js";
import type { loginUserSchema, registerUserSchema } from "@/modules/users/user.validation.js";

export const registerUserController = async (
    req: ValidatedRequest<typeof registerUserSchema>,
    res: Response,
) => {
    const newUser = await registerUserService(req.body);

    return res.status(201).json({ data: newUser });
};

export const loginUserController = async (
    req: ValidatedRequest<typeof loginUserSchema>,
    res: Response,
) => {
    const loginResult = await loginUserService(req.body);

    return res.status(200).json({ data: loginResult });
};
