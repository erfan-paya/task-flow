import { jwtVerify, SignJWT } from "jose";
import { authConfig } from "@/config/auth.js";
import { env } from "@/config/env.js";

const secret = new TextEncoder().encode(env.jwt_secret);

export const signAccessToken = async (userId: string) =>
    new SignJWT()
        .setProtectedHeader({ alg: authConfig.jwt.algorithm })
        .setSubject(userId)
        .setIssuedAt()
        .setIssuer(authConfig.jwt.issuer)
        .setAudience(authConfig.jwt.audience)
        .setExpirationTime(authConfig.jwt.accessTokenExpiresIn)
        .sign(secret);

export const verifyAccessToken = async (token: string) =>
    await jwtVerify(token, secret, {
        algorithms: [authConfig.jwt.algorithm],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
    });
