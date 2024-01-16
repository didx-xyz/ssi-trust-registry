import { BaseError } from 'make-error'

export class AuthError extends BaseError {
  constructor(message: string) {
    super(message)
  }
}
