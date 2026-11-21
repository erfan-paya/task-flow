import assert from "node:assert/strict";
import test from "node:test";
import { loginUserSchema, registerUserSchema } from "../../src/modules/users/user.validation.js";

test("normalizes registration email and trims the name", () => {
    const result = registerUserSchema.safeParse({
        name: "  Erfan Paya  ",
        email: " ERFAN@example.com ",
        password: "a-secure-password",
    });

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(result.data.name, "Erfan Paya");
        assert.equal(result.data.email, "erfan@example.com");
    }
});

test("rejects registration with an invalid email", () => {
    const result = registerUserSchema.safeParse({
        name: "Erfan",
        email: "not-an-email",
        password: "a-secure-password",
    });

    assert.equal(result.success, false);
});

test("rejects registration passwords shorter than eight characters", () => {
    const result = registerUserSchema.safeParse({
        name: "Erfan",
        email: "erfan@example.com",
        password: "short",
    });

    assert.equal(result.success, false);
});

test("accepts a valid login payload and normalizes its email", () => {
    const result = loginUserSchema.safeParse({
        email: " ERFAN@example.com ",
        password: "any-non-empty-password",
    });

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(result.data.email, "erfan@example.com");
    }
});

test("rejects login with an empty password", () => {
    const result = loginUserSchema.safeParse({
        email: "erfan@example.com",
        password: "",
    });

    assert.equal(result.success, false);
});
