export class DomainError extends Error {
  readonly code: string;
  constructor(message: string, code = 'DOMAIN_ERROR') {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
  }
}

export class ValidationError extends DomainError {
  fields?: Record<string, string>;
  constructor(message = 'Validation failed', fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}


