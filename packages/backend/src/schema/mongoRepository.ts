import partial from 'lodash.partial'
import { Collection, Db } from 'mongodb'
import { Schema } from '@ssi-trust-registry/common'
import { createLogger } from '../logger'
import { SchemaRepository } from './service'

const logger = createLogger(__filename)

export async function createSchemaRepository(
  database: Db,
): Promise<SchemaRepository> {
  const collection = database.collection('schemas')

  const createSchemaIdIndexResult = await collection.createIndex(
    { schemaId: 1 },
    { unique: true },
  )
  logger.info(
    `Index for schema document 'schemaId' created:`,
    createSchemaIdIndexResult,
  )

  return {
    getAllSchemas: partial(getAllSchemas, collection),
    findBySchemaId: partial(findBySchemaId, collection),
    addSchema: partial(addSchema, collection),
    updateSchema: partial(updateSchema, collection),
  }
}

export async function getAllSchemas(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Schema.parse(s))
}

export async function findBySchemaId(collection: Collection, schemaId: string) {
  const result = await collection.findOne({ schemaId })
  return result && Schema.parse(result)
}

export async function addSchema(collection: Collection, schema: Schema) {
  const schemaData = {
    ...schema,
  }
  await collection.insertOne(schemaData)
  return schema
}

export async function updateSchema(collection: Collection, schema: Schema) {
  const schemaData = {
    ...schema,
  }
  await collection.updateOne(
    { schemaId: schema.schemaId },
    { $set: schemaData },
  )
  return schema
}
