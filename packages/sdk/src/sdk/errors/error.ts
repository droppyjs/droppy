export abstract class DroppyError extends Error {
    public readonly isDroppyError = true;

    constructor(
        public readonly errorType: string,
        message: string,
    ) {
        super(message);
    }
}

export function isDroppyError(error: unknown): error is DroppyError {
    return error instanceof DroppyError;
}
