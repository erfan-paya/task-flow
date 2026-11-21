import type { RequestHandler } from "express";
import { UnauthorizedError } from "@/utils/app-error.js";
import { verifyAccessToken } from "@/utils/jwt.js";

export const authenticationMiddleware: RequestHandler = async (req, _res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        throw new UnauthorizedError("Access token required.");
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authHeader);

    if (!match?.[1]) {
        throw new UnauthorizedError("Invalid authorization header.");
    }

    let payload;

    try {
        ({ payload } = await verifyAccessToken(match[1]));
    } catch {
        throw new UnauthorizedError("Invalid or expired access token.");
    }

    if (!payload.sub) {
        throw new UnauthorizedError("Invalid access token.");
    }

    req.user = {
        id: payload.sub,
    };

    return next();
};
