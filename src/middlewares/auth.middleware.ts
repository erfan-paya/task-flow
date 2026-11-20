import type { RequestHandler } from "express";
import { verifyAccessToken } from "@/utils/jwt.js";

export const authenticationMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            message: "Access token required",
        });
    }

    const token = authHeader.slice(7).trim();
    if (!token || token.includes(" ")) {
        return res.status(401).json({
            status: "error",
            message: "Invalid authorization header",
        });
    }

    try {
        const { payload } = await verifyAccessToken(token);

        if (!payload.sub) {
            return res.status(401).json({
                error: "Invalid access token",
            });
        }

        req.user = {
            id: payload.sub,
        };

        return next();
    } catch {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired access token",
        });
    }
};
