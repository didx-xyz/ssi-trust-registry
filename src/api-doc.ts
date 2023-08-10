import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Entity } from './entity/service'
import { Schema } from './schema/service'

const RegistrySchema = z.object({
  entities: z.array(Entity),
  schemas: z.array(Schema),
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
