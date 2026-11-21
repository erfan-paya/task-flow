import cookieParser from "cookie-parser";
import type { Application } from "express";
import express from "express";
import { corsMiddleware } from "@/middlewares/cors.middleware.js";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
import { notFoundMiddleware } from "@/middlewares/not-found.middleware.js";
import { securityHeadersMiddleware } from "@/middlewares/security-headers.middleware.js";
import { authRouter } from "@/modules/auth/auth.route.js";
import { healthRouter } from "@/modules/health/health.route.js";
import { userRouter } from "@/modules/users/user.route.js";

const app: Application = express();

app.disable("x-powered-by");
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.use(healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
