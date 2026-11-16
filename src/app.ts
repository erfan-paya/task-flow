import type { Application } from "express";
import express from "express";

import { healthRouter } from "@/modules/health/health.route.js";

const app: Application = express();

app.use(express.json());

app.use(healthRouter);

export default app;
