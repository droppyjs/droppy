import { DroppyError } from "./error.js";

export class DroppyHttpError extends DroppyError {
    static type = "http-error";

    constructor(
        public status: number,
        public message: string,
    ) {
        super(DroppyHttpError.type, message);
    }
}
