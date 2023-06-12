import fetch from 'node-fetch'
import { startServer } from './server'

describe('main', () => {
  let port: number
  beforeAll(async () => {
    port = await startServer()
    console.log('after server start')
  })

  test('health endpoint works', async () => {
    const result = await fetch(`http://localhost:${port}/health`)
    const payload = await result.text()
    expect(payload).toEqual(`OK`)
  })
})
