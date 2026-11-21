import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET ??= "test-jwt-secret-that-is-at-least-32-bytes";
process.env.CSRF_SECRET ??= "test-csrf-secret-that-is-at-least-32-bytes";
process.env.DATABASE_URL ??= "postgresql://taskflow:taskflow@localhost:5432/taskflow_test";

const { generateCsrfToken, verifyCsrfToken } = await import("../../src/utils/csrf.js");

test("accepts a newly generated CSRF token", () => {
    const token = generateCsrfToken();

    assert.equal(verifyCsrfToken(token), true);
});

test("rejects a CSRF token after its signature is modified", () => {
    const token = generateCsrfToken();
    const modifiedToken = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;

    assert.equal(verifyCsrfToken(modifiedToken), false);
});

test("rejects malformed CSRF tokens", () => {
    assert.equal(verifyCsrfToken(""), false);
    assert.equal(verifyCsrfToken("not-a-token"), false);
    assert.equal(verifyCsrfToken("1.2.3"), false);
});

test("rejects a token with an invalid nonce format", () => {
    const token = generateCsrfToken();
    const [, , signature] = token.split(".");
    const malformedToken = ` ${token.split(".")[0]}.invalid.${signature}`;

    assert.equal(verifyCsrfToken(malformedToken), false);
});
