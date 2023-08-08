import fs from 'node:fs/promises'
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
  loadSchemas: () => Promise<void>
  getAllSchemas: () => Promise<any>
}

export interface SchemaRepository {
  getAllSchemas: () => Promise<any>
  findBySchemaId: (id: string) => Promise<Schema | null>
  addSchema: (schema: Schema) => Promise<Schema>
  updateSchema: (schema: Schema) => Promise<Schema>
}

export type Schema = z.infer<typeof Schema>
export type SchemaDto = z.infer<typeof SchemaDto>

export const SchemaDto = z
  .object({
    schemaId: z
      .string()
      .openapi({ example: '2NPnMDv5Lh57gVZ3p3SYu3:2:e-KYC:1.0.0' }),
    name: z.string().openapi({ example: 'Digital Identity' }),
  })
  .openapi('SchemaRequest')

export const Schema = SchemaDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SchemaResponse')

async function getAllSchemas(repository: SchemaRepository) {
  return repository.getAllSchemas()
}

async function loadSchemas(repository: SchemaRepository) {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)
  const results = await Promise.allSettled(
    registry.schemas.map(async (s: SchemaDto) => {
      logger.info('Importing schema', s)
      if (await exists(repository, s)) {
        logger.debug('Schema already exists, updating...')
        return updateSchema(repository, s)
      } else {
        logger.debug('Schema does not exist, creating...')
        return addSchema(repository, s)
      }
    }),
  )
  results.forEach((r) => {
    if (r.status !== 'fulfilled') {
      logger.info('Schema import failed with the following error', r.reason)
    }
  })
}

function exists(repository: SchemaRepository, schema: SchemaDto) {
  return repository.findBySchemaId(schema.schemaId)
}

async function addSchema(
  repository: SchemaRepository,
  payload: Record<string, unknown>,
): Promise<void> {
  const schemaDto = SchemaDto.parse(payload)
  const schema = {
    ...schemaDto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await repository.addSchema(schema)
  logger.info('Schema has been created', result)
}

async function updateSchema(
  repository: SchemaRepository,
  payload: Record<string, unknown>,
): Promise<void> {
  const schemaDto = SchemaDto.parse(payload)
  const existingSchema = await repository.findBySchemaId(schemaDto.schemaId)
  if (!existingSchema) {
    throw new Error('Trying to update an Schema that does not exists')
  }
  const schema = {
    ...Schema.parse(existingSchema),
    ...schemaDto,
    updatedAt: new Date().toISOString(),
  }
  const result = await repository.updateSchema(schema)
  logger.info('Schema has been updated', result)
}
