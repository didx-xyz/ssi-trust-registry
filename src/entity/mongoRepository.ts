import partial from 'lodash.partial'
import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Entity, EntityRepository } from './service'

const logger = createLogger(__filename)

export async function createEntityRepository(
  database: Db,
): Promise<EntityRepository> {
  const collection = database.collection('entities')

  const createSubjectIdIndexResult = await collection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for subject document 'id' created`,
    createSubjectIdIndexResult,
  )

  return {
    getAllEntities: partial(getAllEntities, collection),
    findById: partial(findById, collection),
    addEntity: partial(addEntity, collection),
    updateEntity: partial(updateEntity, collection),
  }
}

async function getAllEntities(collection: Collection) {
  return collection.find().toArray()
}

async function findById(collection: Collection, id: string) {
  const result = await collection.findOne({ id })
  return result && Entity.parse(result)
}

async function addEntity(collection: Collection, entity: Entity) {
  const entityData = {
    ...entity,
  }
  await collection.insertOne(entityData)
  return entity
}

async function updateEntity(collection: Collection, entity: Entity) {
  const entityData = {
    ...entity,
  }
  await collection.updateOne({ id: entity.id }, { $set: entityData })
  return entity
}
