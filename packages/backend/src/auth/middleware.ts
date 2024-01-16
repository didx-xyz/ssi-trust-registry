import type { NextFunction, Request, Response } from 'express'
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken'
import { AuthError } from '../errors'
import { config } from '../config'

export interface RequestWithToken extends Request {
  jwtPayload?: jwt.JwtPayload
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { token } = req.cookies
  if (token) {
    const secretKey = config.auth.jwtSecretKey
    try {
      const verification = jwt.verify(token, secretKey)
      if (typeof verification === 'string') {
        throw new Error(
          `Malformed JWT token: received 'string', expected 'object'`,
        )
      } else {
        ;(req as RequestWithToken).jwtPayload = verification
        next()
      }
    } catch (error) {
      let authError: AuthError | undefined
      if (error instanceof TokenExpiredError) {
        authError = new AuthError('Your token has expired.')
      } else if (error instanceof NotBeforeError) {
        authError = new AuthError('Current time is before the nbf claim.')
      } else if (error instanceof JsonWebTokenError) {
        authError = new AuthError('Invalid signature.')
      }
      next(authError ?? error)
    }
  } else {
    res.status(401).json({ error: 'You are not logged in.' })
  }
}
