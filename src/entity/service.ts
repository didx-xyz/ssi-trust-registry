import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { createLogger } from '../logger'
import { DidResolver } from '../did-resolver/did-resolver'
import { SchemaRepository } from '../schema/service'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createEntityService(
  entityRepository: EntityRepository,
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
): Promise<EntityService> {
  return {
    getAllEntities: partial(getAllEntities, entityRepository),
    loadEntities: partial(
      loadEntities,
      entityRepository,
      schemaRepository,
      didResolver,
    ),
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
    id: z.string().openapi({ example: exampleEntityDto.id }),
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

export const Entity = EntityDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('EntityResponse')

async function getAllEntities(repository: EntityRepository) {
  return repository.getAllEntities()
}

async function loadEntities(
  entityRepository: EntityRepository,
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
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

    for (const schemaId of e.credentials) {
      const schema = await schemaRepository.findBySchemaId(schemaId)
      if (!schema) {
        throw new Error(
          `Schema ID ${schemaId} does not exists in trust registry`,
        )
      }
    }

    for (const did of e.dids) {
      const didDocument = await didResolver.resolveDid(did)
      if (!didDocument) {
        throw new Error(`DID ${did} is not resolvable`)
      }
    }

    if (await exists(entityRepository, e)) {
      logger.debug('Entity already exists, updating...')
      return updateEntity(entityRepository, e)
    } else {
      for (const did of e.dids) {
        const didExists = await entityRepository.findByDid(did)
        if (didExists) {
          throw new Error(`DID ${did} already exists`)
        }
      }
      logger.debug('Entity does not exist, creating...')
      return addEntity(entityRepository, e)
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
