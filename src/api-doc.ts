import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

export function generateSwaggerDocs() {
  extendZodWithOpenApi(z)
  const registry = new OpenAPIRegistry()

  const EntityShema = z
    .object({
      id: z
        .string()
        .openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
      name: z.string().openapi({ example: 'Absa' }),
      did: z.string().openapi({ example: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3' }),
      logo_url: z.string().openapi({
        example:
          'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      }),
      domain: z.string().openapi({
        example: 'www.absa.africa',
      }),
      registered_at: z
        .string()
        .datetime()
        .openapi({ example: '2023-05-24T18:14:24' }),
      updated_at: z
        .string()
        .datetime()
        .openapi({ example: '2023-05-24T18:14:24' }),
      role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
      credentials: z
        .array(z.string())
        .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
    })
    .openapi('Enitity')

  const RegistrySchema = z.object({ entities: z.array(EntityShema) })

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
        description: 'List of entities.',
        content: {
          'application/json': {
            schema: RegistrySchema,
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
