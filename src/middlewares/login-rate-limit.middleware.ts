import type { RequestHandler } from "express";
import { TooManyRequestsError } from "@/utils/app-error.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_TRACKED_IPS = 10_000;

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const attempts = new Map<string, RateLimitEntry>();

export const loginRateLimitMiddleware: RequestHandler = (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    let entry = attempts.get(key);

    if (!entry || entry.resetAt <= now) {
        if (attempts.size >= MAX_TRACKED_IPS) {
            for (const [ip, tracked] of attempts) {
                if (tracked.resetAt <= now) attempts.delete(ip);
                if (attempts.size < MAX_TRACKED_IPS) break;
            }
        }

        if (attempts.size >= MAX_TRACKED_IPS) {
            throw new TooManyRequestsError("Login is temporarily unavailable. Try again later.");
        }

        entry = { count: 0, resetAt: now + WINDOW_MS };
        attempts.set(key, entry);
    }

    entry.count += 1;

    res.setHeader("RateLimit-Limit", MAX_ATTEMPTS);
    res.setHeader("RateLimit-Remaining", Math.max(0, MAX_ATTEMPTS - entry.count));
    res.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

    if (entry.count > MAX_ATTEMPTS) {
        throw new TooManyRequestsError("Too many login attempts. Try again later.");
    }

    return next();
};
