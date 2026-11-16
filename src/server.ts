import { env } from "@/config/env.js";
import app from "@/app.js";
import { prisma } from "@/database/prisma.js";

const PORT = env.port;

let isShuttingDown = false;

async function startServer() {
    try {
        
        await prisma.$connect();
        console.log("Database connected successfully");

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = async (signal: string): Promise<void> => {
            if (isShuttingDown) return;

            isShuttingDown = true;
            console.log(`${signal} received. Shutting down...`);

            try {
                await new Promise<void>((resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });

                console.log("HTTP server closed successfully");
            } catch (error) {
                console.error("Error closing HTTP server:", error);
                process.exitCode = 1;
            } finally {
                try {
                    await prisma.$disconnect();
                    console.log("Database disconnected successfully");
                } catch (error) {
                    console.error("Error disconnecting from database:", error);
                    process.exitCode = 1;
                }
            }
        };

        server.on("error", async (error) => {
            console.error("HTTP server error:", error);
            await shutdown("HTTP server error");
            process.exitCode = 1;
        });

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.error("Failed to start server:", error);

        try {
            await prisma.$disconnect();
        } catch (disconnectError) {
            console.error("Error disconnecting from database:", disconnectError);
        }

        process.exitCode = 1;
    }
}

startServer();