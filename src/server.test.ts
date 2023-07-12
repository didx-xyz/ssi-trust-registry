import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'
import fs from 'node:fs/promises'

describe('main', () => {
  const port = 3000
  const url = 'http://localhost'
  let server: Server

  beforeAll(async () => {
    server = await startServer({ port: 3000, url: 'http://localhost' })
  })

  afterAll(async () => {
    server.close()
    await fs.unlink('./src/registry.json.tmp')
  })

  afterEach(async () => {
    await fs.copyFile('./src/registry.json.tmp', './src/registry.json')
  })

  test('health endpoint works', async () => {
    const result = await fetch(`${url}:${port}/health`)
    const payload = await result.text()
    expect(payload).toEqual(`OK`)
  })

  test('invalid submission fails with 400 Bad Request error', async () => {
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

  test('submissions with exisiting DID fails with 500 error', async () => {
    const result = await fetch(`http://localhost:${port}/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Absa',
        did: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3',
        logo_url:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
        domain: 'www.absa.africa',
        role: 'issuer',
        credentials: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'],
      }),
    })
    const status = result.status
    const response = await result.json()
    expect(status).toEqual(500)
    expect(response.error).toEqual(
      'Submission with the same DID already exisits'
    )
  })

  test('correct submissions succeeds with 201 Created and return ID of newly created submission', async () => {
    const result = await fetch(`http://localhost:${port}/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Yoma',
        did: 'did:sov:Enmy7mgJopSsELLXd9G91d',
        logo_url:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
        domain: 'www.yoma.xyz',
        role: 'issuer',
        credentials: ['Enmy7mgJopSsELLXd9G91d:3:CL:24:default'],
      }),
    })
    const status = result.status
    const response = await result.json()
    expect(status).toEqual(201)
    expect(response.id).toEqual(expect.any(String))
  })

  test('correct submissions succeeds and adds it to the list of entities', async () => {
    await fetch(`http://localhost:${port}/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Yoma2',
        did: 'did:sov:MnZVrGhoZwwgtEXT6QBHRS',
        logo_url:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
        domain: 'www.yoma.xyz',
        role: 'issuer',
        credentials: [],
      }),
    })

    const result = await fetch(`http://localhost:${port}/registry`)
    const status = result.status
    const response = await result.json()
    expect(status).toEqual(200)
    expect(response.entities.length).toBe(2)
    expect(response.entities).toEqual([
      {
        id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
        name: 'Absa',
        did: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3',
        logo_url:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
        domain: 'www.absa.africa',
        registered_at: '2023-05-24T18:14:24',
        updated_at: '2023-05-24T18:14:24',
        role: 'issuer',
        credentials: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'],
      },
      {
        id: expect.any(String), // TODO check uuid format
        name: 'Yoma2',
        did: 'did:sov:MnZVrGhoZwwgtEXT6QBHRS',
        logo_url:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
        domain: 'www.yoma.xyz',
        role: 'issuer',
        credentials: [],
        createdAt: expect.any(String), // TODO check date time format
        updatedAt: expect.any(String), // TODO check date time format
      },
    ])
  })

  //
})
