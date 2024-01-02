import { BaseError } from 'make-error'

export class FieldError extends BaseError {
  field: string
  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}

export class AuthError extends BaseError {
  constructor(message: string) {
    super(message)
  }
}
