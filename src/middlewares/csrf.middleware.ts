import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { verifyCsrfToken } from "@/utils/csrf.js";

export const csrfMiddleware: RequestHandler = (req, res, next) => {
    const csrfCookie = req.cookies?.csrfToken;
    const csrfHeader = req.header("X-CSRF-Token");

    if (
        typeof csrfCookie !== "string" ||
        typeof csrfHeader !== "string" ||
        !csrfCookie ||
        !csrfHeader
    ) {
        return res.status(403).json({
            error: "CSRF token missing.",
        });
    }

    const cookieBuffer = Buffer.from(csrfCookie, "utf8");
    const headerBuffer = Buffer.from(csrfHeader, "utf8");

    if (
        cookieBuffer.length !== headerBuffer.length ||
        !timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
        return res.status(403).json({
            error: "Invalid CSRF token.",
        });
    }

    if (!verifyCsrfToken(csrfHeader)) {
        return res.status(403).json({
            error: "Invalid CSRF token.",
        });
    }

    return next();
};
