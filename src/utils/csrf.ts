import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { authConfig } from "@/config/auth.js";
import { env } from "@/config/env.js";

const generateSignature = (payload: string): string => {
    return createHmac("sha256", env.csrf_secret).update(payload).digest("hex");
};

export const generateCsrfToken = (): string => {
    const timestamp = Date.now().toString();
    const nonce = randomBytes(32).toString("hex");

    const payload = `${timestamp}.${nonce}`;
    const signature = generateSignature(payload);

    return `${payload}.${signature}`;
};

export const verifyCsrfToken = (token: string): boolean => {
    const parts = token.split(".");

    if (parts.length !== 3) return false;

    const [timestamp, nonce, signature] = parts;

    if (!timestamp || !nonce || !signature) return false;

    // Validate timestamp format.
    if (!/^\d+$/.test(timestamp)) return false;

    const issuedAt = Number(timestamp);
    const now = Date.now();

    if (!Number.isSafeInteger(issuedAt)) return false;
    if (issuedAt > now) return false;

    // Check expiration.
    if (now - issuedAt > authConfig.csrf.expiresInMs) return false;

    // Validate nonce and signature formats.
    if (!/^[a-f0-9]{64}$/.test(nonce)) return false;
    if (!/^[a-f0-9]{64}$/.test(signature)) return false;

    const payload = `${timestamp}.${nonce}`;
    const expectedSignature = generateSignature(payload);

    const actualBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (actualBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(actualBuffer, expectedBuffer);
};
