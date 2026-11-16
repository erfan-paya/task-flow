import express, { Application, Request, Response } from "express";

const app: Application = express()

app.use(express.json())

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "TaskFlow API is running"
    })
})

export default app;