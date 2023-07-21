import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'
import fs from 'node:fs/promises'
import { config } from './config'
import { closeConnection, connectToDatabase } from './database'
import { deleteAll, initSubmissions } from './submission/mongoRepository'
import { initRegistry } from './registry'

describe('api', () => {
  const { port, url } = config.server
  let server: Server

  beforeAll(async () => {
    server = await startServer({ port, url })
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
      const database = await connectToDatabase(config.db)
      initSubmissions(database)
      initRegistry(database)
      await deleteAll()
      // backup prod database
      await fs.copyFile(
        './src/db/submissions.json',
        './src/db/submissions.json.backup',
      )
    })

    afterAll(async () => {
      // restore prod database
      await fs.copyFile(
        './src/db/submissions.json.backup',
        './src/db/submissions.json',
      )
      await fs.unlink('./src/db/submissions.json.backup')
      await closeConnection()
    })

    beforeEach(async () => {
      // clear database
      await deleteAll()
      await fs.writeFile('./src/db/submissions.json', '[]')
    })

    test('invalid submission fails with 400 Bad Request error', async () => {
      const result = await post(`http://localhost:${port}/submissions`, {})
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
      await post(`http://localhost:${port}/submissions`, absaSubmission)
      const result = await post(
        `http://localhost:${port}/submissions`,
        absaSubmission,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(500)
      expect(response.error).toEqual(
        'Submission with the same DID already exisits',
      )
    })

    test('correct submissions succeeds with 201 Created and return ID of newly created submission', async () => {
      const result = await post(
        `http://localhost:${port}/submissions`,
        yomaSubmission,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(201)
      expect(response.id).toEqual(expect.any(String))
    })

    test('correct submissions succeeds and adds it to the list', async () => {
      await post(`http://localhost:${port}/submissions`, absaSubmission)

      const result = await fetch(`http://localhost:${port}/submissions`)
      const status = result.status
      const submissions = await result.json()
      expect(status).toEqual(200)
      expect(submissions.length).toBe(1)
      expect(submissions).toEqual([
        {
          ...absaSubmission,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])

      // Registry should be still empty
      const registryResult = await fetch(`http://localhost:${port}/registry`)
      const registry = await registryResult.json()
      expect(registry).toEqual({ entities: [], registry: [] })
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
