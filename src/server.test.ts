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
})
