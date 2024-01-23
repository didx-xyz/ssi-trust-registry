import { RouteConfig } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Entity, Schema } from '@ssi-trust-registry/common'
import { Request, Response } from 'express'
import partial from 'lodash.partial'
import { EntityService } from './service'
import { SchemaService } from '../schema/service'
import { createLogger } from '../logger'
import { RequestWithToken } from '../auth/middleware'

const logger = createLogger(__filename)

const RegistryResponseSchema = z.object({
  entities: z.array(Entity),
  schemas: z.array(Schema),
})

export function createRegistryController(
  entityService: EntityService,
  schemaService: SchemaService,
): EntityController {
  return {
    getRouteConfigDocs,
    getRegistry: partial(getRegistry, entityService, schemaService),
  }
}

export interface EntityController {
  getRouteConfigDocs: () => RouteConfig[]
  getRegistry: (req: RequestWithToken, res: Response) => Promise<void>
}

async function getRegistry(
  entityService: EntityService,
  schemaService: SchemaService,
  req: Request,
  res: Response,
) {
  logger.info('Reading the registry from the file.')
  const registry = {
    entities: await entityService.getAllEntities(),
    schemas: await schemaService.getAllSchemas(),
  }
  res.status(200).json(registry)
}

function getRouteConfigDocs(): RouteConfig[] {
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
