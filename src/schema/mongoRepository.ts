import fs from 'node:fs/promises'
import { Collection, Db, MongoServerError } from 'mongodb'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

const DUPLICATED_KEY_ERROR = 11000

let _database: Db
let _collection: Collection

export function initSchemas(database: Db) {
  _database = database
  _collection = _database.collection('schemas')
}

export async function getAllSchemas() {
  return _collection.find().toArray()
}

export async function loadSchemas() {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)

  const createSchemaIdIndexResult = await _collection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for schema document 'id' created:`,
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
  const schemaData = {
    id: schema,
    schema,
  }
  const result = await _collection.insertOne(schemaData)
  logger.info(`Schema has been stored to the database`, result)
  return result
}
