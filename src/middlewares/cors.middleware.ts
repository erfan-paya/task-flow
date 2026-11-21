import type { RequestHandler } from "express";
import { env } from "@/config/env.js";

const allowedMethods = "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";
const allowedHeaders = "Content-Type,Authorization,X-CSRF-Token";

export const corsMiddleware: RequestHandler = (req, res, next) => {
    const origin = req.header("Origin");

    res.vary("Origin");

    if (origin && env.cors_origins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Expose-Headers",
            "RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset",
        );
    }

    if (req.method !== "OPTIONS") {
        return next();
    }

    if (!origin || !env.cors_origins.includes(origin)) {
        return res.status(403).end();
    }

    res.setHeader("Access-Control-Allow-Methods", allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
    res.setHeader("Access-Control-Max-Age", "600");

    return res.status(204).end();
};
