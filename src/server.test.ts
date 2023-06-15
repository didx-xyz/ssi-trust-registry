import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'
import { AddressInfo } from 'net'

describe('main', () => {
  let port: number
  let server: Server

  beforeAll(async () => {
    server = await startServer()
    port = (server.address() as AddressInfo).port
  })

  afterAll(() => {
    server.close()
  })

  test('health endpoint works', async () => {
    const result = await fetch(`http://localhost:${port}/health`)
    const payload = await result.text()
    expect(payload).toEqual(`OK`)
  })
})
