import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'
import fs from 'node:fs/promises'

describe('api', () => {
  let port: number
  let server: Server

  beforeAll(async () => {
    server = await startServer()
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    server.close()
  })

  test('health endpoint works', async () => {
    const result = await fetch(`${url}:${port}/health`)
    const payload = await result.text()
    expect(payload).toEqual(`OK`)
  })

  describe('submission', () => {
    const absaSubmission = {
      name: 'Absa',
      did: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3',
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: 'issuer',
      credentials: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'],
    }

    const yomaSubmission = {
      name: 'Yoma',
      did: 'did:sov:Enmy7mgJopSsELLXd9G91d',
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.yoma.xyz',
      role: 'issuer',
      credentials: ['Enmy7mgJopSsELLXd9G91d:3:CL:24:default'],
    }

    beforeAll(async () => {
      await fs.copyFile('./src/registry.json', './src/registry.json.tmp')
    })

    afterAll(async () => {
      await fs.unlink('./src/registry.json.tmp')
    })

    afterEach(async () => {
      await fs.copyFile('./src/registry.json.tmp', './src/registry.json')
    })

    test('invalid submission fails with 400 Bad Request error', async () => {
      const result = await post(`http://localhost:${port}/submission`, {})
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

    test('submissions with exisiting DID fails with 500 error', async () => {
      const result = await post(
        `http://localhost:${port}/submission`,
        absaSubmission
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(500)
      expect(response.error).toEqual(
        'Submission with the same DID already exisits'
      )
    })

    test('correct submissions succeeds with 201 Created and return ID of newly created submission', async () => {
      const result = await post(
        `http://localhost:${port}/submission`,
        yomaSubmission
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(201)
      expect(response.id).toEqual(expect.any(String))
    })

    test('correct submissions succeeds and adds it to the list of entities', async () => {
      await post(`http://localhost:${port}/submission`, yomaSubmission)

      const result = await fetch(`http://localhost:${port}/registry`)
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(200)
      expect(response.entities.length).toBe(2)
      expect(response.entities).toEqual([
        {
          ...absaSubmission,
          id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
          registered_at: '2023-05-24T18:14:24',
          updated_at: '2023-05-24T18:14:24',
        },
        {
          ...yomaSubmission,
          id: expect.any(String), // TODO check uuid format
          createdAt: expect.any(String), // TODO check date time format
          updatedAt: expect.any(String), // TODO check date time format
        },
      ])
    })
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
