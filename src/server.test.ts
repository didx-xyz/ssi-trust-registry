import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'

describe('main', () => {
  const port = 3000
  const url = 'http://localhost'
  let server: Server

  beforeAll(async () => {
    server = await startServer({ port: 3000, url: 'http://localhost' })
  })

  afterAll(() => {
    server.close()
  })

  test('health endpoint works', async () => {
    const result = await fetch(`${url}:${port}/health`)
    const payload = await result.text()
    expect(payload).toEqual(`OK`)
  })

  test('invalid submission fails with 400 error', async () => {
    const result = await fetch(`http://localhost:${port}/submission`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const status = result.status
    const response = await result.json()
    expect(status).toEqual(400)
    expect(response.error).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['name'],
        message: 'Required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['did'],
        message: 'Required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['logo_url'],
        message: 'Required',
      },
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['domain'],
        message: 'Required',
      },
      {
        expected: "'issuer' | 'verifier'",
        received: 'undefined',
        code: 'invalid_type',
        path: ['role'],
        message: 'Required',
      },
      {
        code: 'invalid_type',
        expected: 'array',
        received: 'undefined',
        path: ['credentials'],
        message: 'Required',
      },
    ])
  })
})
