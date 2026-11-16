
import { env } from "@/config/env.js";
import app from "@/app.js";
import { prisma } from "@/database/prisma.js";

const PORT = env.port;
let isShuttingDown = false;

async function startServer(): Promise<void> {
    try {
        // 1. Connect to PostgreSQL and verify connectivity.
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;

        console.log("Database connected successfully");

        // 2. Start Express.
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // 3. Handle HTTP server errors (e.g. EADDRINUSE).
        server.on("error", async (error) => {
            console.error("HTTP server error:", error);
            await shutdown(server, 1);
        });

        // 4. Handle process termination.
        process.on("SIGINT", () => {
            void shutdown(server, 0);
        });

        process.on("SIGTERM", () => {
            void shutdown(server, 0);
        });

    } catch (error) {
        console.error("Server startup failed:", error);

        await prisma.$disconnect();
        process.exitCode = 1;
    }
}

async function shutdown(
    server: ReturnType<typeof app.listen>,
    exitCode: number,
): Promise<void> {
    if (isShuttingDown) return;

    isShuttingDown = true;
    console.log("Shutting down...");

    try {
        // Close HTTP server only if it is listening.
        if (server.listening) {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }
    } catch (error) {
        console.error("HTTP server shutdown failed:", error);
        exitCode = 1;
    }

    try {
        await prisma.$disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Database disconnection failed:", error);
        exitCode = 1;
    }

    process.exitCode = exitCode;
    console.log("Shutdown complete");
}

void startServer();
