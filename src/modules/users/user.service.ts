import { prisma } from "@/database/prisma.js";
import { NotFoundError } from "@/utils/app-error.js";

export const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    return user;
};
