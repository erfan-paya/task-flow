import type { RequestHandler } from "express";

import { NotFoundError } from "@/utils/app-error.js";

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};
