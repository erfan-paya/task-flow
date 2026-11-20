export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.name = new.target.name;
        this.statusCode = statusCode;

        Error.captureStackTrace(this, new.target);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
