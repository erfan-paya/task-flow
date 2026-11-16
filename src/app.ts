import { healthRouter } from "@/modules/health/health.route.js";
import express from "express";
import type { Application } from "express"

const app: Application = express()

app.use(express.json())

app.use(healthRouter)

export default app;