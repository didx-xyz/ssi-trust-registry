import fs from 'node:fs/promises'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Db, MongoServerError } from 'mongodb'
import { createLogger } from './logger'

const logger = createLogger(__filename)

extendZodWithOpenApi(z)

const DUPLICATED_KEY_ERROR = 11000

let _database: Db

export function initRegistry(database: Db) {
  _database = database
}

export async function getRegistry() {
  const registryCollection = _database.collection('registry')
  const subjectsCollection = _database.collection('subjects')

  return {
    entities: await subjectsCollection.find().toArray(),
    registry: await registryCollection.find().toArray(),
  }
}

export async function loadRegistry() {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)

  const registryCollection = _database.collection('registry')
  const createRegistryIdIndexResult = await registryCollection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for registry document 'id' created: ${JSON.stringify(
      createRegistryIdIndexResult,
      null,
      2,
    )}`,
  )

  try {
    const registryInsertionResult = await registryCollection.insertOne({
      id: 'registry-core-document',
      schemas: registry.schemas,
    })
    logger.info(
      `Registry has been stored: ${JSON.stringify(
        registryInsertionResult,
        null,
        2,
      )}`,
    )
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.code === DUPLICATED_KEY_ERROR
    ) {
      logger.info(`Document with duplicated key has not been inserted`)
    } else {
      throw error
    }
  }

  const subjectsCollection = _database.collection('subjects')
  const createSubjectIdIndexResult = await subjectsCollection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for subject document 'id' created: ${JSON.stringify(
      createSubjectIdIndexResult,
      null,
      2,
    )}`,
  )

  try {
    const subjectsInsertionResult = await subjectsCollection.insertMany(
      registry.entities,
    )
    logger.info(
      `Subjects has been stored: ${JSON.stringify(
        subjectsInsertionResult,
        null,
        2,
      )}`,
    )
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.code === DUPLICATED_KEY_ERROR
    ) {
      logger.info(`Document with duplicated key has not been inserted`)
    } else {
      throw error
    }
  }
}

const EntityShema = z
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
    registered_at: z
      .string()
      .datetime()
      .openapi({ example: '2023-05-24T18:14:24' }),
    updated_at: z
      .string()
      .datetime()
      .openapi({ example: '2023-05-24T18:14:24' }),
    role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('Enitity')

export const RegistrySchema = z.object({ entities: z.array(EntityShema) })
