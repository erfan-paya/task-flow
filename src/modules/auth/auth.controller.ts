import type { Request, Response } from "express";
import { authConfig } from "@/config/auth.js";
import type { ValidatedRequest } from "@/middlewares/validate.middleware.js";
import {
    loginUserService,
    refreshAccessToken,
    registerUserService,
} from "@/modules/auth/auth.service.js";
import type { loginUserSchema, registerUserSchema } from "@/modules/users/user.validation.js";
import { UnauthorizedError } from "@/utils/app-error.js";

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

    res.cookie("refreshToken", loginResult.refreshToken, {
        ...authConfig.refreshCookie,
    });

    return res.status(200).json({
        data: {
            accessToken: loginResult.accessToken,
            user: loginResult.user,
        },
    });
};

export const refreshTokenController = async (req: Request, res: Response) => {
    const rawToken = req.cookies?.refreshToken;

    if (!rawToken || typeof rawToken !== "string") {
        throw new UnauthorizedError("Refresh token required.");
    }

    const result = await refreshAccessToken(rawToken);

    res.cookie("refreshToken", result.refreshToken, {
        ...authConfig.refreshCookie,
    });

    return res.status(200).json({
        data: {
            accessToken: result.accessToken,
        },
    });
};
