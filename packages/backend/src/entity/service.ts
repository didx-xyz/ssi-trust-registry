import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { v4 as uuidv4 } from 'uuid'
import { Entity, EntityDto } from '@ssi-trust-registry/common'
import { createLogger } from '../logger'
import { ValidationService } from './validationService'
import { ClientSession } from 'mongodb'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createEntityService(
  entityRepository: EntityRepository,
  validationService: ValidationService,
): Promise<EntityService> {
  return {
    getAllEntities: partial(getAllEntities, entityRepository),
    loadEntities: partial(loadEntities, entityRepository, validationService),
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
  addEntity: (
    entity: Entity,
    config?: { session?: ClientSession },
  ) => Promise<Entity>
  updateEntity: (
    entity: Entity,
    config?: { session?: ClientSession },
  ) => Promise<Entity>
}

export const EntityImportDto = EntityDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
}).openapi('EntityImportRequest')

async function getAllEntities(repository: EntityRepository) {
  return repository.getAllEntities()
}

async function loadEntities(
  entityRepository: EntityRepository,
  validationService: ValidationService,
  entityPayloads: Record<string, unknown>[],
) {
  const entityDtos = entityPayloads.map((e) => {
    const entityDto = EntityImportDto.parse(e)
    const invalidDid = entityDto.dids.find((did) => !did.startsWith('did:'))
    if (invalidDid) {
      throw new Error(`DID ${invalidDid} is not fully quilifed`)
    }
    return entityDto
  })

  for (const e of entityDtos) {
    logger.info(`Importing entity ${e.id}`, e)
    await validationService.validateDids(e.dids)
    await validationService.validateSchemas(e.credentials)
    const existingEntity = await entityRepository.findById(e.id)
    if (existingEntity) {
      logger.debug('Entity already exists, updating...')
      return updateEntity(entityRepository, { ...existingEntity, ...e })
    } else {
      for (const did of e.dids) {
        const didExists = await entityRepository.findByDid(did)
        if (didExists) {
          throw new Error(`DID ${did} already exists`)
        }
      }
      logger.debug('Entity does not exist, creating...')
      return addEntity(entityRepository, e, { entityId: e.id })
    }
  }
}

async function addEntity(
  repository: EntityRepository,
  entityDto: EntityDto,
  { entityId }: { entityId?: string } = {},
): Promise<void> {
  const entity = {
    ...entityDto,
    id: entityId || uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addEntity(entity)
  logger.info(`Entity ${entity.id} has been added`)
}

async function updateEntity(
  repository: EntityRepository,
  entity: Entity,
): Promise<void> {
  if (!(await repository.findById(entity.id))) {
    throw new Error('Trying to update an Entity that does not exists')
  }
  const updatedEntity = {
    ...entity,
    updatedAt: new Date().toISOString(),
  }
  await repository.updateEntity(updatedEntity)
  logger.info(`Entity ${entity.id} has been updated`)
}
