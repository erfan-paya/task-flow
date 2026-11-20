import { z } from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(2).max(50).trim(),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
});

export const loginUserSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
