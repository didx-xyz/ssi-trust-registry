import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Entity } from './entity/service'
import { Schema } from './schema/service'
import { Invitation, InvitationDto, Submission } from './submission/domain'

const RegistrySchema = z.object({
  entities: z.array(Entity),
  schemas: z.array(Schema),
})

const UpdateSubmissionRequestSchema = z.object({
  submission: Submission,
  entity: Entity,
})

const CreateInvitationResponseSchema = z.object({
  emailAddress: z.string().openapi({
    example: 'test@example.com',
  }),
  id: z.string().openapi({
    example: 'tz4a98xxat96iws9zmbrgj3a',
  }),
  createdAt: z.string().openapi({
    example: '2023-05-24T18:14:24',
  }),
  url: z.string().openapi({
    example: 'http://localhost:3001/submit/tz4a98xxat96iws9zmbrgj3a',
  }),
})

const UserAuthCredentialsSchema = z.object({
  email: z.string(),
  password: z.string(),
})

const UserLogOutResponseSchema = z.object({
  message: z
    .string()
    .openapi({ example: 'You have been successfully logged out.' }),
})

export function generateSwaggerDocs() {
  const registry = new OpenAPIRegistry()

  registry.registerPath({
    method: 'get',
    path: '/health',
    summary: 'Healthcheck endpoint',
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/text': {
            schema: z.string(),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/registry',
    summary: 'Returns the whole registry',
    request: {},
    responses: {
      200: {
        description: 'List of entities',
        content: {
          'application/json': {
            schema: RegistrySchema,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/submissions',
    summary: 'Returns submissions list',
    request: {},
    responses: {
      200: {
        description: 'List of submissions',
        content: {
          'application/json': {
            schema: z.array(Submission),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/submissions',
    summary: 'Creates submission',
    request: { params: Submission },
    responses: {
      200: {
        description: 'Created submission',
        content: {
          'application/json': {
            schema: Submission,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/submissions/:id',
    summary: 'Returns single submission',
    request: {},
    responses: {
      200: {
        description: 'Single submission',
        content: {
          'application/json': {
            schema: Submission,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'put',
    path: '/submissions/:id',
    summary: 'Updates single submission',
    request: { params: UpdateSubmissionRequestSchema },
    responses: {
      200: {
        description: 'Updated submission',
        content: {
          'application/json': {
            schema: Submission,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/invitations',
    summary: 'Returns invitations list',
    request: {},
    responses: {
      200: {
        description: 'List of invitations',
        content: {
          'application/json': {
            schema: z.array(Invitation),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/invitations',
    summary: 'Create invitation',
    request: { params: InvitationDto },
    responses: {
      200: {
        description: 'Created invitation',
        content: {
          'application/json': {
            schema: CreateInvitationResponseSchema,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/invitations/:id',
    summary: 'Returns single invitation',
    request: {},
    responses: {
      200: {
        description: 'Single invitation',
        content: {
          'application/json': {
            schema: Invitation,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/invitations/:id/submissions',
    summary: 'Returns submission by invitation id',
    request: {},
    responses: {
      200: {
        description: 'Submission by invitation id',
        content: {
          'application/json': {
            schema: z.array(Submission),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Logs user in',
    request: { params: UserAuthCredentialsSchema },
    responses: {
      200: {
        description: 'Session token',
        content: {
          'application/json': {
            schema: z.object({ token: z.string() }),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/auth/logout',
    summary: 'Logs user out',
    request: {},
    responses: {
      200: {
        description: 'Logout message',
        content: {
          'application/json': {
            schema: UserLogOutResponseSchema,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/auth/whoami',
    summary: 'Returns logged user id',
    request: {},
    responses: {
      200: {
        description: 'Logged user id',
        content: {
          'application/json': {
            schema: z.object({
              id: z.string().openapi({ example: 'admin' }),
            }),
          },
        },
      },
    },
  })

  const generator = new OpenApiGeneratorV3(registry.definitions)

  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Trust Registry',
      description:
        '[http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)',
    },
    servers: [{ url: 'v1' }],
  })

  return doc
}
