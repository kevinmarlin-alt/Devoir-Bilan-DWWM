export class AppError extends Error {
    constructor(message, {
        status = 500,
        code = 'INTERNAL_ERROR',
        details= null,
        cause = undefined
    } = {}) {
        super(message, { cause });

        this.name = "AppError"
        this.statusCode = status
        this.code = code
        this.details = details
    }
}