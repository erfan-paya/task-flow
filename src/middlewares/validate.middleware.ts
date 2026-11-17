import { type RequestHandler } from "express";
import type { ZodType } from "zod";

import { BadRequestError } from "@/utils/app-error.js";

export const validat = (schema: ZodType): RequestHandler => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues.map((issue) => issue.message).join(", ");

            return next(new BadRequestError(message));
        }

        req.body = result.data;

        next();
    };
};
