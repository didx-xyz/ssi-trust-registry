import type { Request, Response } from 'express'
import { createLogger } from '../logger'

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
  getUser: (req: Request, res: Response) => Promise<void>
}

async function logIn(req: Request, res: Response) {
  const payload = req.body
  const { email, password } = payload
  logger.info(`Login:`, email)
  if (email === 'admin' && password === 'admin') {
    const token = { user: 'admin' }
    res.cookie('token', JSON.stringify(token), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })
    res.status(200).json({ token })
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

async function getUser(req: Request, res: Response) {
  console.log('req.cookies', req.cookies)
  const { token } = req.cookies
  if (token) {
    res.status(200).json(token)
  } else {
    res.status(403).json({ error: 'You are not logged in.' })
  }
}
