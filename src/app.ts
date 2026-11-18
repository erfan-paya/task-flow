import type { Application } from "express";
import express from "express";

import { errorMiddleware } from "@/middlewares/error.middleware.js";
import { notFoundMiddleware } from "@/middlewares/not-found.middleware.js";
import { authRouter } from "@/modules/auth/auth.route.js";
import { healthRouter } from "@/modules/health/health.route.js";

const app: Application = express();

app.use(express.json());

app.use(healthRouter);
app.use("/api/v1/auth/", authRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
