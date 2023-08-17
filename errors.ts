export class ApplicationError extends Error {
  // deno-lint-ignore no-explicit-any
  constructor(message: string, public data: Record<string, any> = {}) {
    super(message);
  }
}

export class UserError extends ApplicationError {}
