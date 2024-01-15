import fetch from 'node-fetch'
import { Db } from 'mongodb'
import { Server } from 'http'
import {
  Invitation,
  exampleEntityDto,
  exampleSchemaDto,
} from '@ssi-trust-registry/common'

import { startServer } from './server'
import { config } from './config'
import { close, connect } from './database'
import { DidResolver } from './did-resolver/did-resolver'
import { SchemaService } from './schema/service'
import { EntityService } from './entity/service'
import { createAppContext } from './context'
import { correctDids } from './__tests__/fixtures'
import { EmailClientStub, createEmailClientStub } from './email/client-stub'
import { createFakeDidResolver } from './__tests__/helpers'

const { port, url } = config.server

describe('api', () => {
  let server: Server
  let database: Db
  let didResolver: DidResolver
  let entityService: EntityService
  let schemaService: SchemaService
  let emailClient: EmailClientStub
  let cookie: string

  beforeAll(async () => {
    database = await connect(config.db)
    emailClient = createEmailClientStub()
    didResolver = await createFakeDidResolver(correctDids)
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

  afterEach(() => {
    while (emailClient.sentMessages.length) {
      emailClient.sentMessages.pop()
    }
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

    let invitationWithUrl: Invitation & { url: string }

    beforeEach(async () => {
      await database.dropDatabase()
      await schemaService.loadSchemas([exampleSchemaDto])
      invitationWithUrl = await generateNewInvitation(cookie)
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

    test('invitation endpoint resends email', async () => {
      const emailAddress = 'this-is-an-example@test.com'
      const { id } = await generateNewInvitation(cookie, {
        emailAddress,
      })

      await resendNewInvitation(cookie, { id })

      expect(
        emailClient.sentMessages.filter(({ to }) => to === emailAddress).length,
      ).toEqual(2)
    })

    test('invalid invitationId fails with 500 error', async () => {
      const result = await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: 'invalid' },
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
        `http://localhost:${port}/api/submissions`,
        {
          ...absaSubmission,
          invitationId: invitationWithUrl.id,
          credentials: [nonExistentSchemaId],
        },
        cookie,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(400)
      expect(response.error).toEqual(
        `Schema ID '${nonExistentSchemaId}' is not present in the trust registry`,
      )
    })

    test('invalid submission fails with 400 Bad Request error', async () => {
      console.log(invitationWithUrl)
      const result = await post(
        `http://localhost:${port}/api/submissions`,
        {},
        cookie,
      )
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
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['invitationId'],
          message: 'Required',
        },
      ])
    })

    test('submissions with DID of a different entity fail with 500 error', async () => {
      await entityService.loadEntities([exampleEntityDto])
      const result = await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(400)
      expect(response.error).toContain(
        'A different entity has already registered the did',
      )
    })

    test('correct submission succeeds and adds it to the list', async () => {
      await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )

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

    test('correct submission succeeds with 201 Created and return ID of newly created submission', async () => {
      const result = await post(
        `http://localhost:${port}/api/submissions`,
        { ...yomaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
      const status = result.status
      const response = await result.json()
      expect(status).toEqual(201)
      expect(response.id).toEqual(expect.any(String))
    })

    test('submission approval - change submission state and add new entity', async () => {
      const submissionResult = await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
      const submissionResponse = await submissionResult.json()
      const approvalResult = await put(
        `http://localhost:${port}/api/submissions/${submissionResponse.id}`,
        { state: 'approved' },
        cookie,
      )
      const approvalResponse = await approvalResult.json()
      expect(approvalResponse.submission.state).toEqual('approved')
      expect(approvalResponse.entity).toBeDefined()

      // Check that invitation is now associated with entity
      const invitationResponse = await fetch(
        `http://localhost:${port}/api/invitations/${invitationWithUrl.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      const updatedInvitation = await invitationResponse.json()
      expect(updatedInvitation.entityId).toEqual(approvalResponse.entity.id)

      // Check that the entity is added to the registry
      const registry = await fetchRegistry()
      expect(registry.entities).toContainEqual(approvalResponse.entity)

      expect(emailClient.sentMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'SSI Trust Registry - Submission Approved',
          }),
        ]),
      )
    })

    test('submission rejection - change submission state and no registry changes', async () => {
      const submissionResult = await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
      const response = await submissionResult.json()
      const rejectionResult = await put(
        `http://localhost:${port}/api/submissions/${response.id}`,
        { state: 'rejected' },
        cookie,
      )
      const updatedSubmission = await rejectionResult.json()
      expect(updatedSubmission.state).toEqual('rejected')
      expect(emailClient.sentMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'SSI Trust Registry - Submission Rejected',
          }),
        ]),
      )
    })

    test('update submission state throws error if not "approved" or "rejected"', async () => {
      const result = await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
      const response = await result.json()
      const invalidUpdateResult = await put(
        `http://localhost:3000/api/submissions/${response.id}`,
        { state: 'unknown' },
        cookie,
      )
      expect(invalidUpdateResult.status).toEqual(500)
      const invalidUpdateResponse = await invalidUpdateResult.json()
      expect(invalidUpdateResponse.error).toEqual(
        'Invalid submission state: unknown',
      )
    })

    test('can send several submissions using same invitationUrl', async () => {
      await post(
        `http://localhost:${port}/api/submissions`,
        { ...absaSubmission, invitationId: invitationWithUrl.id },
        cookie,
      )
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
        `http://localhost:${port}/api/submissions`,
        {
          ...absaSubmission,
          name: 'Updated Absa Name',
          invitationId: invitationWithUrl.id,
        },
        cookie,
      )
      result = await fetch(`http://localhost:${port}/api/submissions`, {
        headers: { Cookie: cookie },
      })
      submissions = await result.json()
      expect(submissions.length).toBe(1)
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

  describe('transaction rollbacks', () => {
    const mockEmailClient = {
      sendInvitationEmail: jest.fn(() => Promise.resolve()),
      sendMailFromTemplate: jest.fn(() => Promise.resolve({})),
    }
    beforeAll(async () => {
      server.close()
      const context = await createAppContext({
        database,
        didResolver,
        emailClient: mockEmailClient,
      })
      schemaService = context.schemaService
      server = await startServer(config.server, context)
    })

    beforeEach(async () => {
      await schemaService.loadSchemas([exampleSchemaDto])
    })

    test('when unable to send email, do not create invitation', async () => {
      const emailAddress = 'invitationRollback@test.com'
      mockEmailClient.sendInvitationEmail.mockRejectedValueOnce(
        new Error('Unknown email error'),
      )
      await generateNewInvitation(cookie, {
        emailAddress,
      })
      const invitationsResponse = await fetch(
        `http://localhost:${port}/api/invitations`,
        {
          headers: { Cookie: cookie },
        },
      )
      const invitations = await invitationsResponse.json()
      expect(invitations).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            emailAddress,
          }),
        ]),
      )
    })

    test('submission approval - when unable to send email, do not update submission state or create new entity', async () => {
      const emailAddress = 'submissionrollback@test.com'
      const invitation: Invitation = await generateNewInvitation(cookie, {
        emailAddress,
      })
      const registry = await fetchRegistry()
      const submissionResponse = await post(
        `http://localhost:${port}/api/submissions`,
        {
          name: 'Fake Entity',
          dids: ['did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3'],
          logo_url: 'https://fake.com/fake.svg',
          domain: 'https://fake.com',
          role: ['issuer' as const],
          credentials: [
            'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
          ],
          invitationId: invitation.id,
        },
        cookie,
      )
      const submission = await submissionResponse.json()
      mockEmailClient.sendMailFromTemplate.mockRejectedValueOnce(
        new Error('Unknown email error'),
      )
      await put(
        `http://localhost:${port}/api/submissions/${submission.id}`,
        { state: 'approved' },
        cookie,
      )
      const updatedRegistry = await fetchRegistry()
      expect(registry).toEqual(updatedRegistry)
      const updatedInvitationResponse = await fetch(
        `http://localhost:${port}/api/invitations/${invitation.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      const updatedInvitation = await updatedInvitationResponse.json()
      expect(invitation).toMatchObject(updatedInvitation)
      const updatedSubmissionResponse = await fetch(
        `http://localhost:${port}/api/submissions/${submission.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      const updatedSubmission = await updatedSubmissionResponse.json()
      expect(submission).toEqual(updatedSubmission)
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
        "Schema ID 'did:indy:sovrin:staging:nonexistingschemaid123/anoncreds/v0/SCHEMA/e-KYC/1.0.0' is not present in the trust registry",
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
  }: {
    emailAddress: string
  } = { emailAddress: 'test@example.com' },
) {
  const response = await post(
    `http://localhost:${port}/api/invitations`,
    {
      emailAddress,
    },
    cookie,
  )
  return response.json()
}

async function resendNewInvitation(
  cookie: string,
  {
    id,
  }: {
    id: string
  } = { id: 'test@example.com' },
) {
  const response = await post(
    `http://localhost:${port}/api/invitations/${id}/resend`,
    {},
    cookie,
  )
  return await response.json()
}

function post(
  endpoint: string,
  payload: Record<string, unknown>,
  cookie?: string,
) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie ?? '',
    },
    body: JSON.stringify(payload),
  })
}

function put(
  endpoint: string,
  payload: Record<string, unknown>,
  cookie?: string,
) {
  return fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie ?? '',
    },
    body: JSON.stringify(payload),
  })
}
