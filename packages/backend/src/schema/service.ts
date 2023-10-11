import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { createLogger } from '../logger'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSchemaService(repository: SchemaRepository) {
  return {
    loadSchemas: partial(loadSchemas, repository),
    getAllSchemas: partial(getAllSchemas, repository),
  }
}

export interface SchemaService {
  loadSchemas: (schemas: Record<string, unknown>[]) => Promise<void>
  getAllSchemas: () => Promise<Schema[]>
}

export interface SchemaRepository {
  getAllSchemas: () => Promise<Schema[]>
  findBySchemaId: (id: string) => Promise<Schema | null>
  addSchema: (schema: Schema) => Promise<Schema>
  updateSchema: (schema: Schema) => Promise<Schema>
}

export type Schema = z.infer<typeof Schema>
export type SchemaDto = z.infer<typeof SchemaDto>

export const exampleSchemaDto = {
  schemaId:
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
  name: 'Digital Identity',
}

export const SchemaDto = z
  .object({
    schemaId: z.string().openapi({ example: exampleSchemaDto.schemaId }),
    name: z.string().openapi({ example: exampleSchemaDto.name }),
  })
  .openapi('SchemaRequest')

export const Schema = SchemaDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SchemaResponse')

async function getAllSchemas(repository: SchemaRepository) {
  return repository.getAllSchemas()
}

async function loadSchemas(
  repository: SchemaRepository,
  schemaPayloads: Record<string, unknown>[],
) {
  const schemaDtos = schemaPayloads.map((e) => {
    const schemaDto = SchemaDto.parse(e)
    if (!isFullyQualifiedSchemaId(schemaDto.schemaId)) {
      throw new Error(`Schema ID ${schemaDto.schemaId} is not fully qualified`)
    }
    return schemaDto
  })

  for (const s of schemaDtos) {
    logger.info(`Importing schema ${s.schemaId}`, s)
    if (await exists(repository, s)) {
      logger.debug('Schema already exists, updating...')
      return updateSchema(repository, s)
    } else {
      logger.debug('Schema does not exist, creating...')
      return addSchema(repository, s)
    }
  }
}

function exists(repository: SchemaRepository, schema: SchemaDto) {
  return repository.findBySchemaId(schema.schemaId)
}

async function addSchema(
  repository: SchemaRepository,
  schemaDto: SchemaDto,
): Promise<void> {
  const schema = {
    ...schemaDto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addSchema(schema)
  logger.info(`Schema ${schema.schemaId} has been added`)
}

async function updateSchema(
  repository: SchemaRepository,
  schemaDto: SchemaDto,
): Promise<void> {
  const existingSchema = await repository.findBySchemaId(schemaDto.schemaId)
  if (!existingSchema) {
    throw new Error('Trying to update an Schema that does not exists')
  }
  const schema = {
    ...Schema.parse(existingSchema),
    ...schemaDto,
    updatedAt: new Date().toISOString(),
  }
  await repository.updateSchema(schema)
  logger.info(`Schema ${schema.schemaId} has been updated`)
}

function isFullyQualifiedSchemaId(schemaId: string) {
  const didIndyAnonCredsBase =
    /(did:indy:((?:[a-z][_a-z0-9-]*)(?::[a-z][_a-z0-9-]*)?):([1-9A-HJ-NP-Za-km-z]{21,22}))\/anoncreds\/v0/

  const didIndySchemaIdRegex = new RegExp(
    `^${didIndyAnonCredsBase.source}/SCHEMA/(.+)/([0-9.]+)$`,
  )

  return schemaId.match(didIndySchemaIdRegex)
}
