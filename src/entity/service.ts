import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { createLogger } from '../logger'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createEntityService(
  repository: EntityRepository,
): Promise<EntityService> {
  return {
    getAllEntities: partial(getAllEntities, repository),
    loadEntities: partial(loadEntities, repository),
  }
}

export interface EntityService {
  getAllEntities: () => Promise<Entity[]>
  loadEntities: (schemas: Record<string, unknown>[]) => Promise<void>
}

export interface EntityRepository {
  getAllEntities: () => Promise<Entity[]>
  findById: (id: string) => Promise<Entity | null>
  findByDid: (did: string) => Promise<Entity | null>
  addEntity: (entity: Entity) => Promise<Entity>
  updateEntity: (entity: Entity) => Promise<Entity>
  deleteAll: () => Promise<boolean>
}

export type Entity = z.infer<typeof Entity>
export type EntityDto = z.infer<typeof EntityDto>

export const EntityDto = z
  .object({
    id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    dids: z.array(z.string()).openapi({
      example: [
        'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
      ],
    }),
    logo_url: z.string().openapi({
      example:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    }),
    domain: z.string().openapi({
      example: 'www.absa.africa',
    }),
    role: z
      .array(z.enum(['issuer', 'verifier']))
      .openapi({ example: ['issuer', 'verifier'] }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('EntityRequest')

export const Entity = EntityDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('EntityResponse')

async function getAllEntities(repository: EntityRepository) {
  return repository.getAllEntities()
}

async function loadEntities(
  repository: EntityRepository,
  entityPayloads: Record<string, unknown>[],
) {
  const entityDtos = entityPayloads.map((e) => {
    const entityDto = EntityDto.parse(e)
    const invalidDid = entityDto.dids.find((did) => !did.startsWith('did:'))
    if (invalidDid) {
      throw new Error(`DID ${invalidDid} is not fully quilifed`)
    }
    return entityDto
  })

  for (const e of entityDtos) {
    logger.info(`Importing entity ${e.id}`, e)
    if (await exists(repository, e)) {
      logger.debug('Entity already exists, updating...')
      return updateEntity(repository, e)
    } else {
      for (const did of e.dids) {
        const didExists = await repository.findByDid(did)
        if (didExists) {
          throw new Error(`DID ${did} already exists`)
        }
      }
      logger.debug('Entity does not exist, creating...')
      return addEntity(repository, e)
    }
  }
}

async function exists(repository: EntityRepository, entity: EntityDto) {
  return repository.findById(entity.id)
}

async function addEntity(
  repository: EntityRepository,
  entityDto: EntityDto,
): Promise<void> {
  const entity = {
    ...entityDto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addEntity(entity)
  logger.info(`Entity ${entity.id} has been added`)
}

async function updateEntity(
  repository: EntityRepository,
  entityDto: EntityDto,
): Promise<void> {
  const existingEntity = await repository.findById(entityDto.id)
  if (!existingEntity) {
    throw new Error('Trying to update an Entity that does not exists')
  }
  const entity = {
    ...existingEntity,
    ...entityDto,
    updatedAt: new Date().toISOString(),
  }
  await repository.updateEntity(entity)
  logger.info(`Entity ${entity.id} has been updated`)
}
