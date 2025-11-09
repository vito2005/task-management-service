import {
  DomainError,
  NotFoundError,
  ValidationError,
} from "@domain/errors/errors";

export function toHttpError(err: unknown) {
  if (err instanceof ValidationError) {
    return {
      status: 400,
      body: { error: err.code, message: err.message, fields: err.fields },
    };
  }
  if (err instanceof NotFoundError) {
    return { status: 404, body: { error: err.code, message: err.message } };
  }
  if (err instanceof DomainError) {
    return { status: 422, body: { error: err.code, message: err.message } };
  }
  return {
    status: 500,
    body: { error: "INTERNAL_SERVER_ERROR", message: "Unexpected error" },
  };
}
