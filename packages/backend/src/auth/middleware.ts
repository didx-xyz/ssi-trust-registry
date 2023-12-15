import type { NextFunction, Request, Response } from 'express'
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken'
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
        next(
          new Error(
            `Malformed JWT token: received 'string', expected 'object'`,
          ),
        )
      } else {
        ;(req as RequestWithToken).jwtPayload = verification
        next()
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(403).json({ error: 'Your token has expired.' })
      } else if (error instanceof NotBeforeError) {
        res.status(403).json({ error: 'Current time is before the nbf claim.' })
      } else if (error instanceof JsonWebTokenError) {
        res.status(403).json({ error: 'Invalid signature.' })
      } else {
        res.status(403).json({ error: 'Unknown token error.' })
      }
    }
  } else {
    res.status(403).json({ error: 'You are not logged in.' })
  }
}
