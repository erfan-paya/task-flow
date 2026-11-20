import { Prisma } from "@generated/prisma/client.js";
import { prisma } from "@/database/prisma.js";
import type { LoginUserInput, RegisterUserInput } from "@/modules/users/user.validation.js";
import { ConflictError, UnauthorizedError } from "@/utils/app-error.js";
import { signAccessToken } from "@/utils/jwt.js";
import { hashPassword, verifyPassword } from "@/utils/password.js";

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

    const token = await signAccessToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};
