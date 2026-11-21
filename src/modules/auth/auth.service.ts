import { randomUUID } from "node:crypto";
import { Prisma } from "@generated/prisma/client.js";
import { authConfig } from "@/config/auth.js";
import { prisma } from "@/database/prisma.js";
import type { LoginUserInput, RegisterUserInput } from "@/modules/users/user.validation.js";
import { ConflictError, UnauthorizedError } from "@/utils/app-error.js";
import { signAccessToken } from "@/utils/jwt.js";
import { hashPassword, verifyPassword } from "@/utils/password.js";
import { generateRefreshToken, hashRefreshToken } from "@/utils/refresh-token.js";

export const registerUserService = async (registerInput: RegisterUserInput) => {
    const userExists = await prisma.user.findUnique({
        where: {
            email: registerInput.email,
        },
    });

    if (userExists) throw new ConflictError("Email already exists.");

    const hashedPassword = await hashPassword(registerInput.password);

    try {
        const newUser = await prisma.user.create({
            data: {
                name: registerInput.name,
                email: registerInput.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return newUser;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
            throw new ConflictError("Email already exists.");

        throw error;
    }
};

export const loginUserService = async (loginInput: LoginUserInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email: loginInput.email,
        },
    });

    if (!user) throw new UnauthorizedError("Invalid email or password.");

    const isValidPassword = await verifyPassword(user.password, loginInput.password);

    if (!isValidPassword) throw new UnauthorizedError("Invalid email or password.");

    const accessToken = await signAccessToken(user.id);

    const refreshTokenResult = await createRefreshToken(user.id);

    return {
        accessToken,
        refreshToken: refreshTokenResult.token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};

export const logoutUserService = async (rawToken?: string) => {
    if (!rawToken) return;

    const tokenHash = hashRefreshToken(rawToken);

    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};

export const createRefreshToken = async (userId: string, familyId?: string) => {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);

    const currentFamilyId = familyId ?? randomUUID();

    const expiresAt = new Date(Date.now() + authConfig.refreshToken.expiresInMs);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId,
            familyId: currentFamilyId,
            expiresAt,
        },
    });

    return {
        token: rawToken,
        familyId: currentFamilyId,
    };
};

export const refreshAccessToken = async (rawToken: string) => {
    const tokenHash = hashRefreshToken(rawToken);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
        const storedToken = await tx.refreshToken.findUnique({
            where: { tokenHash },
        });

        // Token does not exist.
        if (!storedToken) {
            return { type: "invalid" as const };
        }

        // A revoked token has been reused.
        if (storedToken.revokedAt) {
            await tx.refreshToken.updateMany({
                where: {
                    familyId: storedToken.familyId,
                    revokedAt: null,
                },
                data: { revokedAt: now },
            });

            return { type: "reuse" as const };
        }

        // Token has expired.
        if (storedToken.expiresAt <= now) {
            await tx.refreshToken.updateMany({
                where: {
                    id: storedToken.id,
                    revokedAt: null,
                },
                data: { revokedAt: now },
            });

            return { type: "expired" as const };
        }

        // Atomically consume the old token.
        const revokeResult = await tx.refreshToken.updateMany({
            where: {
                id: storedToken.id,
                revokedAt: null,
            },
            data: { revokedAt: now },
        });

        // Another request may have consumed this token first.
        if (revokeResult.count !== 1) {
            const latestToken = await tx.refreshToken.findUnique({
                where: { id: storedToken.id },
            });

            if (latestToken?.revokedAt) {
                await tx.refreshToken.updateMany({
                    where: {
                        familyId: storedToken.familyId,
                        revokedAt: null,
                    },
                    data: { revokedAt: now },
                });

                return { type: "reuse" as const };
            }

            return { type: "invalid" as const };
        }

        // Generate the replacement token.
        const newRawToken = generateRefreshToken();
        const newTokenHash = hashRefreshToken(newRawToken);

        await tx.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: storedToken.userId,
                familyId: storedToken.familyId,
                expiresAt: new Date(now.getTime() + authConfig.refreshToken.expiresInMs),
            },
        });

        // Sign inside the transaction so a signing failure rolls back rotation.
        const accessToken = await signAccessToken(storedToken.userId);

        return {
            type: "success" as const,
            accessToken,
            refreshToken: newRawToken,
        };
    });

    if (result.type !== "success") {
        throw new UnauthorizedError("Invalid or expired refresh token.");
    }

    return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    };
};
