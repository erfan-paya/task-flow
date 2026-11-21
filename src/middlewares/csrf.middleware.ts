import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { ForbiddenError } from "@/utils/app-error.js";
import { verifyCsrfToken } from "@/utils/csrf.js";

export const csrfMiddleware: RequestHandler = (req, _res, next) => {
    const csrfCookie = req.cookies?.csrfToken;
    const csrfHeader = req.header("X-CSRF-Token");

    if (
        typeof csrfCookie !== "string" ||
        typeof csrfHeader !== "string" ||
        !csrfCookie ||
        !csrfHeader
    ) {
        throw new ForbiddenError("CSRF token missing.");
    }

    const cookieBuffer = Buffer.from(csrfCookie, "utf8");
    const headerBuffer = Buffer.from(csrfHeader, "utf8");

    if (
        cookieBuffer.length !== headerBuffer.length ||
        !timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
        throw new ForbiddenError("Invalid CSRF token.");
    }

    if (!verifyCsrfToken(csrfHeader)) {
        throw new ForbiddenError("Invalid CSRF token.");
    }

    return next();
};
