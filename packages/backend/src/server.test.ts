import fetch from 'node-fetch'
import { Db } from 'mongodb'
import { Server } from 'http'

import { startServer } from './server'
import { config } from './config'
import { close, connect } from './database'
import { SchemaService, exampleSchemaDto } from './schema/service'
import { EntityService, exampleEntityDto } from './entity/service'
import { InvitationWithUrl } from './submission/service'
import { createAppContext } from './context'
import { correctDids } from './__tests__/fixtures'
import { EmailClientStub, createEmailClientStub } from './email/client-stub'
import { createFakeDidResolver } from './__tests__/helpers'

const { port, url } = config.server

describe('api', () => {
  let server: Server
  let database: Db
  let entityService: EntityService
  let schemaService: SchemaService
  let emailClient: EmailClientStub
  let cookie: string

  beforeAll(async () => {
    database = await connect(config.db)
    const didResolver = await createFakeDidResolver(correctDids)
    emailClient = createEmailClientStub()
    const context = await createAppContext({
      database,
      didResolver,
      emailClient,
    })
    entityService = context.entityService
    schemaService = context.schemaService
    server = await startServer(config.server, context)
    const response = await post(
      `http://localhost:${port}/api/auth/login`,
      {
        email: 'admin',
        password: 'admin',
      },
      '',
    )
    cookie = response.headers.get('set-cookie') || ''
  })

  afterAll(async () => {
    await database.dropDatabase()
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
      dids: ['did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3'],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: ['issuer' as const],
      credentials: [
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      ],
    }

    const yomaSubmission = {
      name: 'Yoma',
      dids: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb'],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.yoma.xyz',
      role: ['issuer' as const],
      credentials: [
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      ],
    }

    let invitation: InvitationWithUrl

    beforeEach(async () => {
      await database.dropDatabase()
      await schemaService.loadSchemas([exampleSchemaDto])
      invitation = await generateNewInvitation(cookie)
    })

    test('invitation endpoint sends email', async () => {
      await generateNewInvitation(cookie, {
        emailAddress: 'this-is-an-example@test.com',
      })
      expect(emailClient.sentMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ to: 'this-is-an-example@test.com' }),
        ]),
      )
    })

    test('invalid invitationId fails with 500 error', async () => {
      const result = await post(
        `${url}:${port}/api/submissions/invalid`,
        absaSubmission,
        cookie,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(500)
      expect(response.error).toEqual('Invitation not found')
    })

    test('submission with invalid credential schemaId fails with 500 error', async () => {
      const nonExistentSchemaId =
        'did:indy:sovrin:staging:nonexistingschemaid123'
      const result = await post(
        invitation.apiUrl,
        {
          ...absaSubmission,
          credentials: [nonExistentSchemaId],
        },
        cookie,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(400)
      expect(response.error).toEqual(
        `Schema '${nonExistentSchemaId}' is not present in the trust registry`,
      )
    })

    test('invalid submission fails with 400 Bad Request error', async () => {
      console.log(invitation)
      const result = await post(invitation.apiUrl, {}, cookie)
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
          expected: 'array',
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

    test('submissions with DID of a different entity fail with 500 error', async () => {
      await entityService.loadEntities([exampleEntityDto])
      const result = await post(invitation.apiUrl, absaSubmission, cookie)
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(400)
      expect(response.error).toContain(
        'A different entity has already registered the did',
      )
    })

    test('correct submissions succeeds and adds it to the list', async () => {
      await post(invitation.apiUrl, absaSubmission, cookie)

      const result = await fetch(`http://localhost:${port}/api/submissions`, {
        headers: { Cookie: cookie },
      })
      const status = result.status
      const submissions = await result.json()
      expect(status).toEqual(200)
      expect(submissions.length).toBe(1)
      expect(submissions).toEqual([
        {
          ...absaSubmission,
          id: expect.any(String),
          invitationId: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          state: 'pending',
        },
      ])

      // Registry should not have changed
      const registry = await fetchRegistry()
      expect(registry).toEqual({
        entities: [],
        schemas: [
          {
            ...exampleSchemaDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      })
    })

    test('correct submissions succeeds with 201 Created and return ID of newly created submission', async () => {
      const result = await post(invitation.apiUrl, yomaSubmission, cookie)
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(201)
      expect(response.id).toEqual(expect.any(String))
    })

    test('can send several submissions using same invitationUrl', async () => {
      await post(invitation.apiUrl, absaSubmission, cookie)
      let result = await fetch(`http://localhost:${port}/api/submissions`, {
        headers: { Cookie: cookie },
      })
      let submissions = await result.json()
      expect(submissions.length).toBe(1)
      expect(submissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...absaSubmission,
          }),
        ]),
      )
      await post(
        invitation.apiUrl,
        {
          ...absaSubmission,
          name: 'Updated Absa Name',
        },
        cookie,
      )
      result = await fetch(`http://localhost:${port}/api/submissions`, {
        headers: { Cookie: cookie },
      })
      submissions = await result.json()
      expect(submissions.length).toBe(2)
      expect(submissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...absaSubmission,
            name: 'Updated Absa Name',
          }),
        ]),
      )
    })
  })

  describe('schemas', () => {
    const testSchemas = [{ ...exampleSchemaDto }]

    beforeEach(async () => {
      await database.dropDatabase()
    })

    test('load schema to the registry', async () => {
      await schemaService.loadSchemas(testSchemas)

      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([
        {
          schemaId: exampleSchemaDto.schemaId,
          name: exampleSchemaDto.name,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('update schema with an existing ID', async () => {
      const updatedTestSchemas = [
        {
          schemaId: exampleSchemaDto.schemaId,
          name: 'Updated Digital Identity',
        },
      ]
      await schemaService.loadSchemas(testSchemas)
      await schemaService.loadSchemas(updatedTestSchemas)

      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([
        {
          schemaId: exampleSchemaDto.schemaId,
          name: 'Updated Digital Identity',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('load of invalid schema fails', async () => {
      const testSchemasWithInvalidSchema = [
        {
          schemaId: exampleSchemaDto.schemaId,
          name: exampleSchemaDto.name,
        },
        {},
      ]

      await expect(() =>
        schemaService.loadSchemas(testSchemasWithInvalidSchema),
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

    test('unqualified schema fails', async () => {
      const testSchemasWithInvalidSchemaId = [
        {
          schemaId: 'C279iyCR8wtKiPC8o9iPmb:2:e-KYC:1.0.0',
          name: exampleSchemaDto.name,
        },
      ]

      await expect(() =>
        schemaService.loadSchemas(testSchemasWithInvalidSchemaId),
      ).rejects.toThrow(
        `Schema ID C279iyCR8wtKiPC8o9iPmb:2:e-KYC:1.0.0 is not fully qualified`,
      )

      const registry = await fetchRegistry()
      expect(registry.schemas).toEqual([])
    })
  })

  describe('entities', () => {
    const testSchemas = [{ ...exampleSchemaDto }]
    const absaEntity = { ...exampleEntityDto }

    beforeEach(async () => {
      await database.dropDatabase()
      await schemaService.loadSchemas(testSchemas)
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
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['id'],
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

    test('each did must be unique', async () => {
      await entityService.loadEntities([absaEntity])

      const testEntities = [
        { ...absaEntity, id: 'bb7e7d3d-bf7c-4e08-8d9f-84057cc838bb' },
      ]

      await expect(() =>
        entityService.loadEntities(testEntities),
      ).rejects.toThrow(
        'DID did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3 already exists',
      )

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([
        {
          ...absaEntity,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('each DID is resolvable', async () => {
      await entityService.loadEntities([absaEntity])

      const testEntities = [
        { ...absaEntity, dids: ['did:indy:sovrin:abcdefgh'] },
      ]

      await expect(() =>
        entityService.loadEntities(testEntities),
      ).rejects.toThrow('DID did:indy:sovrin:abcdefgh is not resolvable')

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([
        {
          ...absaEntity,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })

    test('all schemas in credentials must exists in registry', async () => {
      const testEntities = [
        {
          ...absaEntity,
          credentials: [
            'did:indy:sovrin:staging:nonexistingschemaid123/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
          ],
        },
      ]

      await expect(() =>
        entityService.loadEntities(testEntities),
      ).rejects.toThrow(
        'Schema ID did:indy:sovrin:staging:nonexistingschemaid123/anoncreds/v0/SCHEMA/e-KYC/1.0.0 does not exists in trust registry',
      )

      const registry = await fetchRegistry()
      expect(registry.entities).toEqual([])
    })
  })
})

async function fetchRegistry() {
  const response = await fetch(`http://localhost:${port}/api/registry`)
  return response.json()
}

async function generateNewInvitation(
  cookie: string,
  {
    emailAddress,
    entityId,
  }: {
    emailAddress: string
    entityId?: string
  } = { emailAddress: 'test@example.com' },
) {
  const response = await post(
    `http://localhost:${port}/api/invitation`,
    {
      emailAddress,
      entityId,
    },
    cookie,
  )
  return await response.json()
}

function post(
  endpoint: string,
  payload: Record<string, unknown>,
  cookie: string,
) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  })
}
