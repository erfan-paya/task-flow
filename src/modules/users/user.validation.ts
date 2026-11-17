import { z } from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
