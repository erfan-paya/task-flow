import "dotenv/config";

const port = Number(process.env.PORT ?? 3000);
const database_url = process.env.DATABASE_URL;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number between 1 and 65535");
}

if (!database_url) {
    throw new Error("DATABASE_URL is required");
}

export const env = {
    port,
    database_url,
};
