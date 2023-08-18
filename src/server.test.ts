import fetch from 'node-fetch'
import { startServer } from './server'
import { Server } from 'http'
import { config } from './config'
import { close, connect } from './database'
import { SchemaRepository, SchemaService } from './schema/service'
import { EntityRepository, EntityService } from './entity/service'
import { SubmissionRepository } from './submission/service'
import { createAppContext } from './context'

const { port, url } = config.server

describe('api', () => {
  let server: Server
  let submissionRepository: SubmissionRepository
  let entityRepository: EntityRepository
  let entityService: EntityService
  let schemaRepository: SchemaRepository
  let schemaService: SchemaService

  beforeAll(async () => {
    const database = await connect(config.db)
    const context = await createAppContext({ database })
    submissionRepository = context.submissionRepository
    schemaRepository = context.schemaRepository
    entityRepository = context.entityRepository
    entityService = context.entityService
    schemaService = context.schemaService
    server = await startServer({ port, url }, context)
  })

  afterAll(async () => {
    await entityRepository.deleteAll()
    await schemaRepository.deleteAll()
    await submissionRepository.deleteAll()
    await close()
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

    beforeEach(async () => {
      await submissionRepository.deleteAll()
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
      const registry = await fetchRegistry()
      expect(registry).toEqual({ entities: [], schemas: [] })
    })
  })

  describe('schemas', () => {
    beforeEach(async () => {
      await schemaRepository.deleteAll()
    })

    test('load schema to the registry', async () => {
      const testSchemas = [
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Digital Identity',
        },
      ]
      await schemaService.loadSchemas(testSchemas)

      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Digital Identity',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('update schema with an existing ID', async () => {
      const testSchemas = [
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Digital Identity',
        },
      ]
      const updatedTestSchemas = [
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Updated Digital Identity',
        },
      ]
      await schemaService.loadSchemas(testSchemas)
      await schemaService.loadSchemas(updatedTestSchemas)

      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Updated Digital Identity',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('load of invalid schema fails', async () => {
      const testSchemas = [
        {
          schemaId: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0',
          name: 'Digital Identity',
        },
        {},
      ]

      await expect(() =>
        schemaService.loadSchemas(testSchemas),
      ).rejects.toThrow(
        JSON.stringify(
          [
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['schemaId'],
              message: 'Required',
            },
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['name'],
              message: 'Required',
            },
          ],
          null,
          2,
        ),
      )
      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([])
    })
  })

  describe('entities', () => {
    const absaEntity = {
      id: 'bb7e7d3d-bf7c-4e08-8d9f-84057cc838bb',
      name: 'Absa',
      dids: [
        'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
      ],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: ['issuer', 'verifier'],
      credentials: ['C279iyCR8wtKiPC8o9iPmb:2:e-KYC:8.0.0'],
    }

    beforeEach(async () => {
      await entityRepository.deleteAll()
    })

    test('load entity to the registry', async () => {
      const testEntities = [absaEntity]
      await entityService.loadEntities(testEntities)

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([
        {
          ...absaEntity,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('update entity with an existing ID', async () => {
      const testEntities = [absaEntity]
      const updatedTestEntities = [
        {
          ...absaEntity,
          name: 'Updated Absa',
        },
      ]
      await entityService.loadEntities(testEntities)
      await entityService.loadEntities(updatedTestEntities)

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([
        {
          ...absaEntity,
          name: 'Updated Absa',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('load of invalid entity fails and no entity is stored', async () => {
      const testEntities = [absaEntity, {}]

      await expect(() =>
        entityService.loadEntities(testEntities),
      ).rejects.toThrow(
        JSON.stringify(
          [
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['id'],
              message: 'Required',
            },
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['name'],
              message: 'Required',
            },
            {
              code: 'invalid_type',
              expected: 'array',
              received: 'undefined',
              path: ['dids'],
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
              code: 'invalid_type',
              expected: 'array',
              received: 'undefined',
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
          ],
          null,
          2,
        ),
      )
      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([])
    })

    test('unqualified did throws and error', async () => {
      const testEntities = [{ ...absaEntity, dids: ['C279iyCR8wtKiPC8o9iPmb'] }]

      await expect(() =>
        entityService.loadEntities(testEntities),
      ).rejects.toThrow('DID C279iyCR8wtKiPC8o9iPmb is not fully quilifed')

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([])
    })
  })
})

function fetchRegistry() {
  return fetch(`http://localhost:${port}/registry`).then((response) =>
    response.json(),
  )
}

function post(endpoint: string, payload: Record<string, unknown>) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
