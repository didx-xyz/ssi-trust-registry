import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'
import { ValidationService } from './validationService'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createEntityService(
  entityRepository: EntityRepository,
  validationService: ValidationService,
): Promise<EntityService> {
  return {
    getAllEntities: partial(getAllEntities, entityRepository),
    getEntityById: partial(getEntityById, entityRepository),
    getEntityByDid: partial(getEntityByDid, entityRepository),
    loadEntities: partial(loadEntities, entityRepository, validationService),
    updateEntity: partial(updateEntity, entityRepository),
    deleteEntity: partial(deleteEntity, entityRepository),
  }
}

export interface EntityService {
  getAllEntities: () => Promise<Entity[]>
  getEntityById: (id: string) => Promise<Entity | null>
  getEntityByDid: (did: string) => Promise<Entity | null>
  loadEntities: (schemas: Record<string, unknown>[]) => Promise<void>
  updateEntity: (entity: Entity) => Promise<Entity>
  deleteEntity: (id: string) => Promise<void>
}

export interface EntityRepository {
  getAllEntities: () => Promise<Entity[]>
  findEntityById: (id: string) => Promise<Entity | null>
  findEntityByDid: (did: string) => Promise<Entity | null>
  addEntity: (entity: Entity) => Promise<Entity>
  updateEntity: (entity: Entity) => Promise<Entity>
  deleteEntity: (id: string) => Promise<void>
}

export type Entity = z.infer<typeof Entity>
export type EntityDto = z.infer<typeof EntityDto>

export const exampleEntityDto = {
  id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
  name: 'Absa',
  logo_url: 'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
  domain: 'www.absa.africa',
  dids: [
    'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
  ],
  role: ['issuer', 'verifier'],
  credentials: [
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
  ],
}

export const EntityDto = z
  .object({
    name: z.string().openapi({ example: exampleEntityDto.name }),
    dids: z.array(z.string()).openapi({ example: exampleEntityDto.dids }),
    logo_url: z.string().openapi({ example: exampleEntityDto.logo_url }),
    domain: z.string().openapi({ example: exampleEntityDto.domain }),
    role: z
      .array(z.enum(['issuer', 'verifier']))
      .openapi({ example: ['issuer', 'verifier'] }),
    credentials: z
      .array(z.string())
      .openapi({ example: exampleEntityDto.credentials }),
  })
  .openapi('EntityRequest')

export const EntityImportDto = EntityDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
}).openapi('EntityImportRequest')

export const Entity = EntityDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('EntityResponse')

async function getAllEntities(repository: EntityRepository) {
  return repository.getAllEntities()
}
async function getEntityById(repository: EntityRepository, id: string) {
  return repository.findEntityById(id)
}
async function getEntityByDid(repository: EntityRepository, did: string) {
  return repository.findEntityByDid(did)
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
    const existingEntity = await entityRepository.findEntityById(e.id)
    if (existingEntity) {
      logger.debug('Entity already exists, updating...')
      await updateEntity(entityRepository, { ...existingEntity, ...e })
    } else {
      for (const did of e.dids) {
        const didExists = await entityRepository.findEntityByDid(did)
        if (didExists) {
          throw new Error(`DID ${did} already exists`)
        }
      }
      logger.debug('Entity does not exist, creating...')
      await addEntity(entityRepository, e, { entityId: e.id })
    }
  }
}

async function addEntity(
  repository: EntityRepository,
  entityDto: EntityDto,
  { entityId }: { entityId?: string } = {},
) {
  const entity = {
    ...entityDto,
    id: entityId || uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addEntity(entity)
  logger.info(`Entity ${entity.id} has been added`)
  return entity
}

async function updateEntity(repository: EntityRepository, entity: Entity) {
  if (!(await repository.findEntityById(entity.id))) {
    throw new Error('Trying to update an Entity that does not exists')
  }
  const updatedEntity = {
    ...entity,
    updatedAt: new Date().toISOString(),
  }
  await repository.updateEntity(updatedEntity)
  logger.info(`Entity ${entity.id} has been updated`)
  return updatedEntity
}

async function deleteEntity(
  repository: EntityRepository,
  id: string,
): Promise<void> {
  await repository.deleteEntity(id)
  logger.info(`Entity ${id} has been deleted from the database`)
}
