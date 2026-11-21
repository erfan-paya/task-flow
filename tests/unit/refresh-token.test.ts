import assert from "node:assert/strict";
import test from "node:test";
import { generateRefreshToken, hashRefreshToken } from "../../src/utils/refresh-token.js";

test("generates refresh tokens with 256 bits of entropy encoded as hex", () => {
    const token = generateRefreshToken();

    assert.match(token, /^[a-f0-9]{64}$/);
});

test("generates a different token for each call", () => {
    assert.notEqual(generateRefreshToken(), generateRefreshToken());
});

test("hashes the same refresh token deterministically", () => {
    const token = generateRefreshToken();

    assert.equal(hashRefreshToken(token), hashRefreshToken(token));
});

test("stores a SHA-256 hex digest rather than the raw refresh token", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);

    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.notEqual(hash, token);
});

test("produces different hashes for different refresh tokens", () => {
    assert.notEqual(
        hashRefreshToken(generateRefreshToken()),
        hashRefreshToken(generateRefreshToken()),
    );
});
