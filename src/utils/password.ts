import { argon2id, hash, verify } from "argon2";

export const hashPassword = (password: string) => hash(password, { type: argon2id });

export const verifyPassword = (hash: string, password: string) => verify(hash, password);
