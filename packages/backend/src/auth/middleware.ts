import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
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
    const verification = jwt.verify(token, secretKey)
    if (typeof verification === 'string') {
      next(
        new Error(`Malformed JWT token: received 'string', expected 'object'`),
      )
    } else {
      ;(req as RequestWithToken).jwtPayload = verification
      next()
    }
  } else {
    res.status(403).json({ error: 'You are not logged in.' })
  }
}
