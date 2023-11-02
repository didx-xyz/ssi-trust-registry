import fetch from 'node-fetch'
import { Db } from 'mongodb'
import { Server } from 'http'

import { startServer } from './server'
import { config } from './config'
import { close, connect } from './database'
import { createAppContext } from './context'
import { correctDids } from './__tests__/fixtures'
import { EmailClientStub, createEmailClientStub } from './email/client-stub'

const { url } = config.server
const port = 3010
const backendUrl = `${url}:${port}`

describe('auth', () => {
  let server: Server
  let database: Db
  let emailClient: EmailClientStub

  beforeAll(async () => {
    database = await connect(config.db)
    const didResolver = await createFakeDidResolver(correctDids)
    emailClient = createEmailClientStub()
    const context = await createAppContext({
      database,
      didResolver,
      emailClient,
    })
    server = await startServer({ port, url }, context)
  })

  afterAll(async () => {
    await database.dropDatabase()
    await close()
    server.close()
  })

  test('login with incorrect username and password returns 401 Unauthorized', async () => {
    const response = await post(`${backendUrl}/api/auth/login`, {
      username: 'admin',
      password: 'abcd',
    })
    const result = await response.json()
    expect(response.status).toEqual(401)
    expect(result.error).toEqual('Authorization failed.')
  })

  test('login with correct username and password returns 200 OK and token in cookies', async () => {
    const response = await post(`${backendUrl}/api/auth/login`, {
      email: 'admin',
      password: 'admin',
    })
    const result = await response.json()
    expect(response.status).toEqual(200)
    expect(response.headers.get('set-cookie')).toEqual(
      'token=%7B%22user%22%3A%22admin%22%7D; Path=/; HttpOnly; SameSite=Lax',
    )
    expect(result.token).toEqual({ user: 'admin' })
  })

  test('access protected endpoint returns 403 Forbidden', async () => {
    const response = await fetch(`${backendUrl}/api/auth/whoami`)
    const result = await response.json()
    expect(response.status).toEqual(403)
    expect(result.error).toEqual('You are not logged in.')
  })

  test('access protected endpoint after login returns 200 OK', async () => {
    await post(`${backendUrl}/api/auth/login`, {
      email: 'admin',
      password: 'admin',
    })

    const response = await fetch(`${backendUrl}/api/auth/whoami`, {
      headers: {
        Cookie: 'token=abcd',
      },
    })
    expect(response.status).toEqual(200)
  })
})

function post(endpoint: string, payload: Record<string, unknown>) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createFakeDidResolver(correctDids: Record<string, any>) {
  return {
    resolveDid: (did: string) => {
      return correctDids[did]
    },
  }
}
