import type { Request, RequestHandler } from "express";
import { type z, type ZodType } from "zod";

import { BadRequestError } from "@/utils/app-error.js";

export type ValidatedRequest<T extends ZodType, P = Record<string, string>> = Request<
    P,
    unknown,
    z.infer<T>
>;

export const validate = <T extends ZodType>(schema: T): RequestHandler => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues.map((i) => i.message).join(", ");
            return next(new BadRequestError(message));
        }

        req.body = result.data;
        next();
    };
};
