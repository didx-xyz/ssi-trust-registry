import fetch from 'node-fetch'
import { Db } from 'mongodb'
import { Server } from 'http'

import { startServer } from './server'
import { config } from './config'
import { close, connect } from './database'
import { createAppContext } from './context'
import { createEmailClientStub } from './email/client-stub'
import { correctDids } from './__tests__/fixtures'
import { createFakeDidResolver } from './__tests__/helpers'

const { url } = config.server
const port = 3010
const backendUrl = `${url}:${port}`

describe('auth', () => {
  let server: Server
  let database: Db

  beforeAll(async () => {
    database = await connect(config.db)
    const didResolver = await createFakeDidResolver(correctDids)
    const emailClient = createEmailClientStub()
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
    const cookie = response.headers.get('set-cookie')
    const cookieRegex =
      /^token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.([^.]+\.[^.]+); Path=\/; HttpOnly; SameSite=Lax$/

    expect(response.status).toEqual(200)
    expect(cookie).toMatch(cookieRegex)
    expect(
      result.token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'),
    ).toBe(true)
  })

  test('access protected endpoint returns 403 Forbidden', async () => {
    const response = await fetch(`${backendUrl}/api/auth/whoami`)
    const result = await response.json()
    expect(response.status).toEqual(403)
    expect(result.error).toEqual('You are not logged in.')
  })

  test('access protected endpoint after login returns 200 OK', async () => {
    const logInResponse = await post(`${backendUrl}/api/auth/login`, {
      email: 'admin',
      password: 'admin',
    })
    const cookie = logInResponse.headers.get('set-cookie') || ''

    const response = await fetch(`${backendUrl}/api/auth/whoami`, {
      headers: {
        Cookie: cookie,
      },
    })
    console.log('user', await response.json())
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
