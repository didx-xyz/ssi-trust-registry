import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createLogger } from '../logger'
import { RequestWithToken } from './middleware'
import { config } from '../config'

const logger = createLogger(__filename)

export async function createAuthController(): Promise<AuthController> {
  return {
    logIn,
    logOut,
    getUser,
  }
}

export interface AuthController {
  logIn: (req: Request, res: Response) => Promise<void>
  logOut: (req: Request, res: Response) => Promise<void>
  getUser: (req: RequestWithToken, res: Response) => Promise<void>
}

async function logIn(req: Request, res: Response) {
  const payload = req.body
  const { email, password } = payload
  logger.info(`Login:`, email)
  if (email === 'admin') {
    const passwordMatch = await verifyPassword(
      password,
      config.auth.adminPasswordHash,
    )
    if (passwordMatch) {
      const token = createToken('admin')
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      })
      res.status(200).json({ token })
    } else {
      res.status(401).json({ error: 'Authorization failed.' })
    }
  } else {
    res.status(401).json({ error: 'Authorization failed.' })
  }
}

async function logOut(req: Request, res: Response) {
  console.log('req.cookies', req.cookies)
  const { token } = req.cookies
  if (token) {
    res.clearCookie('token')
    res.status(200).json({ message: 'You have been succesfully logged out.' })
  } else {
    res.status(403).json({ error: 'You have not been logged in.' })
  }
}

async function getUser(req: RequestWithToken, res: Response) {
  console.log('req.token', req.jwtPayload)
  if (req.jwtPayload) {
    res.status(200).json({ user: req.jwtPayload.sub })
  } else {
    res.status(403).json({ error: 'You are not logged in.' })
  }
}

function createToken(userId: string) {
  const payload = {
    sub: userId,
  }
  const secretKey = config.auth.jwtSecretKey
  const options = {
    expiresIn: '1h',
  }
  return jwt.sign(payload, secretKey, options)
}

function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
