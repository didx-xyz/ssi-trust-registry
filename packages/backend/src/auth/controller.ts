import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createLogger } from '../logger'
import { RequestWithToken } from './middleware'
import { config } from '../config'
import { RouteConfig } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

const logger = createLogger(__filename)

const UserLogInRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
})

const UserLogOutResponseSchema = z.object({
  message: z
    .string()
    .openapi({ example: 'You have been successfully logged out.' }),
})

export async function createAuthController(): Promise<AuthController> {
  return {
    logIn,
    logOut,
    getUser,
    getRouteConfigDocs,
  }
}

export interface AuthController {
  logIn: (req: Request, res: Response) => Promise<void>
  logOut: (req: Request, res: Response) => Promise<void>
  getUser: (req: RequestWithToken, res: Response) => Promise<void>
  getRouteConfigDocs: () => RouteConfig[]
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
      res
        .status(200)
        .cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        })
        .json({ token })
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
    res
      .status(200)
      .clearCookie('token')
      .json({ message: 'You have been succesfully logged out.' })
  } else {
    res.status(403).json({ error: 'You have not been logged in.' })
  }
}

async function getUser(req: RequestWithToken, res: Response) {
  console.log('req.token', req.jwtPayload)
  if (req.jwtPayload) {
    res.status(200).json({ id: req.jwtPayload.sub })
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

function getRouteConfigDocs(): RouteConfig[] {
  return [
    {
      method: 'post',
      path: '/auth/login',
      summary: 'Logs user in',
      request: { params: UserLogInRequestSchema },
      responses: {
        200: {
          description: 'Session token',
          content: {
            'application/json': {
              schema: z.object({ token: z.string() }),
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/auth/logout',
      summary: 'Logs user out',
      request: {},
      responses: {
        200: {
          description: 'Logout message',
          content: {
            'application/json': {
              schema: UserLogOutResponseSchema,
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/auth/whoami',
      summary: 'Returns logged user id',
      request: {},
      responses: {
        200: {
          description: 'Logged user id',
          content: {
            'application/json': {
              schema: z.object({
                id: z.string().openapi({ example: 'admin' }),
              }),
            },
          },
        },
      },
    },
  ]
}
