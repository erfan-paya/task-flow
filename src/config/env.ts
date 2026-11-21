import "dotenv/config";

const port = Number(process.env.PORT ?? 3000);
const database_url = process.env.DATABASE_URL;
const jwt_secret = process.env.JWT_SECRET;
const csrf_secret = process.env.CSRF_SECRET;
const cors_origins = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number between 1 and 65535");
}

if (!database_url) {
    throw new Error("DATABASE_URL is required");
}

if (!jwt_secret) {
    throw new Error("JWT_SECRET is required");
}

if (Buffer.byteLength(jwt_secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes long");
}

if (!csrf_secret) {
    throw new Error("CSRF_SECRET is required");
}

if (Buffer.byteLength(csrf_secret, "utf8") < 32) {
    throw new Error("CSRF_SECRET must be at least 32 bytes long");
}

if (cors_origins.length === 0) {
    throw new Error("CORS_ORIGINS must contain at least one allowed origin");
}

for (const origin of cors_origins) {
    let parsedOrigin: URL;

    try {
        parsedOrigin = new URL(origin);
    } catch {
        throw new Error(`Invalid CORS origin: ${origin}`);
    }

    if (
        !["http:", "https:"].includes(parsedOrigin.protocol) ||
        parsedOrigin.origin !== origin
    ) {
        throw new Error(`CORS_ORIGINS entries must be HTTP(S) origins without paths: ${origin}`);
    }
}

export const env = {
    port,
    database_url,
    jwt_secret,
    csrf_secret,
    cors_origins,
};
