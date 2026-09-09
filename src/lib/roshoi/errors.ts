/**
 * Shared domain errors for Roshoi Core
 */

export class DomainError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
  }
}

export class InvalidTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Invalid order transition ${from} → ${to}`, "INVALID_TRANSITION", 409);
    this.name = "InvalidTransitionError";
  }
}

export class InsufficientPermissionError extends DomainError {
  constructor(permission: string) {
    super(`Missing permission: ${permission}`, "FORBIDDEN", 403);
    this.name = "InsufficientPermissionError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} ${id} not found` : `${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
