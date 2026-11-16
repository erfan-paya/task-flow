import { prisma } from "@/database/prisma.js";
import express from "express";
import type { Application, Request, Response } from "express"

const app: Application = express()

app.use(express.json())

app.get("/health", async (_req: Request, res: Response) => {
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
        return res.status(503).json({
            status: "error",
            services: {
                api: "ok",
                database: "error",
            },
        });
    }
})

export default app;