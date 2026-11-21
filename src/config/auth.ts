export const authConfig = {
    jwt: {
        algorithm: "HS256",
        issuer: "taskflow-api",
        audience: "taskflow-client",
        accessTokenExpiresIn: "15m",
    },

    refreshToken: {
        expiresInMs: 7 * 24 * 60 * 60 * 1000,
    },

    refreshCookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/api/v1/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};
