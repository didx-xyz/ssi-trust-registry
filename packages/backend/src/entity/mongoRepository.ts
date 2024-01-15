import partial from 'lodash.partial'
import { ClientSession, Collection, Db } from 'mongodb'
import { Entity } from '@ssi-trust-registry/common'
import { createLogger } from '../logger'
import { EntityRepository } from './service'

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
    findByDid: partial(findByDid, collection),
    addEntity: partial(addEntity, collection),
    updateEntity: partial(updateEntity, collection),
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

async function addEntity(
  collection: Collection,
  entity: Entity,
  session?: ClientSession,
) {
  const entityData = {
    ...entity,
  }
  await collection.insertOne(entityData, { session })
  return entity
}

async function updateEntity(collection: Collection, entity: Entity) {
  const entityData = {
    ...entity,
  }
  await collection.updateOne({ id: entity.id }, { $set: entityData })
  return entity
}
