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
    console.log('verification', verification)
    if (typeof verification === 'string') {
      next('Verification is string')
    } else {
      ;(req as RequestWithToken).jwtPayload = verification
      next()
    }
  } else {
    res.status(403).json({ error: 'You are not logged in.' })
  }
}
