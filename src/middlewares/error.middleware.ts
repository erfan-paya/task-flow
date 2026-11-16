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

    console.error("Unexpected error:", err);

    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
};
