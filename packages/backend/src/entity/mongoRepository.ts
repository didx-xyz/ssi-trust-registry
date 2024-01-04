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
    findEntityById: partial(findById, collection),
    findEntityByDid: partial(findByDid, collection),
    addEntity: partial(addEntity, collection),
    updateEntity: partial(updateEntity, collection),
    deleteEntity: partial(deleteEntity, collection),
  }
}

async function getAllEntities(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Entity.parse(s))
}

async function findById(collection: Collection, id: string) {
  const result = await collection.findOne({ id })
  return result && Entity.parse(result)
}

async function findByDid(collection: Collection, did: string) {
  const result = await collection.findOne({ dids: did })
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

async function deleteEntity(collection: Collection, id: string) {
  await collection.deleteOne({ id })
}
