import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Schema } from './service'

const logger = createLogger(__filename)

let _database: Db
let _collection: Collection

export async function initSchemas(database: Db) {
  _database = database
  _collection = _database.collection('schemas')
  const createSchemaIdIndexResult = await _collection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for schema document 'id' created:`,
    createSchemaIdIndexResult,
  )
}

export async function getAllSchemas() {
  return _collection.find().toArray()
}

export async function saveSchema(schema: Schema) {
  const schemaData = {
    ...schema,
  }
  return _collection.insertOne(schemaData)
}

export async function updateSchema(schema: Schema) {
  const schemaData = {
    ...schema,
  }
  const result = await _collection.updateOne(
    { schemaId: schema.schemaId },
    { $set: schemaData },
  )
  return result
}

export async function findBySchemaId(schemaId: string) {
  return _collection.findOne({ schemaId })
}
