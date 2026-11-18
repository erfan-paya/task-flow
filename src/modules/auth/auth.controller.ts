import type { Response } from "express";

import type { ValidatedRequest } from "@/middlewares/validate.middleware.js";
import { registerUser } from "@/modules/auth/auth.service.js";
import type { registerUserSchema } from "@/modules/users/user.validation.js";

export const registerUserController = async (
    req: ValidatedRequest<typeof registerUserSchema>,
    res: Response,
) => {
    const newUser = await registerUser(req.body);

    return res.status(201).json({ data: newUser });
};
