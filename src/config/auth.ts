export const authConfig = {
    jwt: {
        algorithm: "HS256",
        issuer: "taskflow-api",
        audience: "taskflow-client",
        accessTokenExpiresIn: "15m",
    },
};
