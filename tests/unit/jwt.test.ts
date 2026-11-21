import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET ??= "test-jwt-secret-that-is-at-least-32-bytes";
process.env.CSRF_SECRET ??= "test-csrf-secret-that-is-at-least-32-bytes";
process.env.DATABASE_URL ??= "postgresql://taskflow:taskflow@localhost:5432/taskflow_test";

const { signAccessToken, verifyAccessToken } = await import("../../src/utils/jwt.js");

test("signs an access token containing the authenticated user subject", async () => {
    const token = await signAccessToken("user-test-id");
    const { payload } = await verifyAccessToken(token);

    assert.equal(payload.sub, "user-test-id");
});

test("rejects a malformed access token", async () => {
    await assert.rejects(() => verifyAccessToken("not-a-jwt"));
});

test("rejects a token signed with a different secret", async () => {
    const { SignJWT } = await import("jose");
    const forgedToken = await new SignJWT()
        .setProtectedHeader({ alg: "HS256" })
        .setSubject("user-test-id")
        .setIssuedAt()
        .setIssuer("taskflow-api")
        .setAudience("taskflow-client")
        .setExpirationTime("15m")
        .sign(new TextEncoder().encode("a-different-secret-that-is-long-enough"));

    await assert.rejects(() => verifyAccessToken(forgedToken));
});
