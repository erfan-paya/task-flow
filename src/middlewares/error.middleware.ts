import type { ErrorRequestHandler } from "express";
import { AppError } from "@/utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }

    if (err && typeof err === "object" && "type" in err) {
        if (err.type === "entity.parse.failed") {
            res.status(400).json({
                status: "error",
                message: "Invalid JSON request body.",
            });
            return;
        }

        if (err.type === "entity.too.large") {
            res.status(413).json({
                status: "error",
                message: "Request body is too large.",
            });
            return;
        }
    }

    console.error("Unexpected error:", err);

    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
};
