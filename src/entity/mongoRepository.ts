import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Entity } from './service'

const logger = createLogger(__filename)

let _database: Db
let _collection: Collection

export async function initEntities(database: Db) {
  _database = database
  _collection = _database.collection('subjects')
  const createSubjectIdIndexResult = await _collection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for subject document 'id' created`,
    createSubjectIdIndexResult,
  )
}

export async function getAllEntities() {
  return _collection.find().toArray()
}

export async function saveEntity(entity: Entity) {
  const entityData = {
    ...entity,
  }
  return _collection.insertOne(entityData)
}

export async function updateEntity(entity: Entity) {
  const entityData = {
    ...entity,
  }
  const result = await _collection.updateOne(
    { id: entity.id },
    { $set: entityData },
  )
  return result
}

export async function findById(id: string) {
  return _collection.findOne({ id })
}
