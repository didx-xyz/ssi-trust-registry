import fs from 'node:fs/promises'
import { Db, MongoServerError } from 'mongodb'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

const DUPLICATED_KEY_ERROR = 11000

let _database: Db

export function initSchemas(database: Db) {
  _database = database
}

export async function getAllSchemas() {
  const registryCollection = _database.collection('schemas')
  return registryCollection.find().toArray()
}

export async function loadSchemas() {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)

  const schemasCollection = _database.collection('schemas')
  const createSchemaIdIndexResult = await schemasCollection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for registry document 'id' created:`,
    createSchemaIdIndexResult,
  )

  try {
    await Promise.all(
      registry.schemas.map((schema: string) => {
        return saveSchema(schema)
      }),
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

async function saveSchema(schema: string) {
  const schemaCollection = _database.collection('schemas')
  const schemaData = {
    id: schema,
    schema,
  }
  const result = await schemaCollection.insertOne(schemaData)
  logger.info(`Schema has been stored to the database`, result)
  return result
}
