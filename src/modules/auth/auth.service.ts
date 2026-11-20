import { Prisma } from "@generated/prisma/client.js";
import { prisma } from "@/database/prisma.js";
import type { RegisterUserInput } from "@/modules/users/user.validation.js";
import { ConflictError } from "@/utils/app-error.js";
import { hashPassword } from "@/utils/password.js";

export const registerUser = async (userInput: RegisterUserInput) => {
    const userExists = await prisma.user.findUnique({
        where: {
            email: userInput.email,
        },
    });

    if (userExists) throw new ConflictError("Email already exists.");

    const hashedPassword = await hashPassword(userInput.password);

    try {
        const newUser = await prisma.user.create({
            data: {
                name: userInput.name,
                email: userInput.email,
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
