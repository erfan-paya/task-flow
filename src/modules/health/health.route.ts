import { prisma } from "@/database/prisma.js";
import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            status: "ok",
            services: {
                api: "ok",
                database: "ok",
            },
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return res.status(503).json({
            status: "error",
            services: {
                api: "ok",
                database: "error",
            },
        });
    }
})

export { router as healthRouter }