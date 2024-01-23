import { RouteConfig } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Entity, Schema } from '@ssi-trust-registry/common'

const RegistryResponseSchema = z.object({
  entities: z.array(Entity),
  schemas: z.array(Schema),
})

export function createEntityController(): EntityController {
  return { getRouteConfigs }
}

export interface EntityController {
  getRouteConfigs: () => RouteConfig[]
}

function getRouteConfigs(): RouteConfig[] {
  return [
    {
      method: 'get',
      path: '/registry',
      summary: 'Returns the whole registry',
      request: {},
      responses: {
        200: {
          description: 'List of entities',
          content: {
            'application/json': {
              schema: RegistryResponseSchema,
            },
          },
        },
      },
    },
  ]
}
