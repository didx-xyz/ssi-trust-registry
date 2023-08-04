import fs from 'node:fs/promises'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import * as repository from './mongoRepository'
import { createLogger } from '../logger'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export type Entity = z.infer<typeof Entity>
export type EntityDto = z.infer<typeof EntityDto>

export const EntityDto = z
  .object({
    id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    did: z.string().openapi({ example: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3' }),
    logo_url: z.string().openapi({
      example:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    }),
    domain: z.string().openapi({
      example: 'www.absa.africa',
    }),
    role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('EntityRequest')

export const Entity = EntityDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('EntityResponse')

export async function loadEntities() {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)
  const results = await Promise.allSettled(
    registry.entities.map(async (e: EntityDto) => {
      logger.debug('Importing entity', e)
      if (await exists(e)) {
        logger.debug('Entity already exists, updating...')
        await updateEntity(e)
      } else {
        logger.debug('Entity does not exist, creating...')
        await addEntity(e)
      }
    }),
  )
  results.forEach((r) => {
    if (r.status === 'fulfilled') {
      logger.info('Entity has been added', r.value)
    } else {
      logger.info('Adding entity failed with the following error', r.reason)
    }
  })
}

async function exists(entity: EntityDto) {
  return repository.findById(entity.id)
}

async function addEntity(payload: Record<string, unknown>): Promise<void> {
  const entityDto = parseEntity(payload)
  const entity = {
    ...entityDto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await repository.saveEntity(entity)
  logger.info('Entity has been created', result)
}

async function updateEntity(payload: Record<string, unknown>): Promise<void> {
  const entityDto = parseEntity(payload)
  const existingEntity = await repository.findById(entityDto.id)
  if (!existingEntity) {
    throw new Error('Trying to update an Entity that does not exists')
  }
  const entity = {
    ...Entity.parse(existingEntity),
    ...entityDto,
    updatedAt: new Date().toISOString(),
  }
  const result = await repository.updateEntity(entity)
  logger.info('Entity has been updated', result)
}

function parseEntity(payload: Record<string, unknown>): EntityDto {
  return EntityDto.parse(payload)
}
