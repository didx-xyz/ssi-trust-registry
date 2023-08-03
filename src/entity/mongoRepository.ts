import fs from 'node:fs/promises'
import { Db, MongoServerError } from 'mongodb'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

const DUPLICATED_KEY_ERROR = 11000

let _database: Db

export function initEntities(database: Db) {
  _database = database
}

export async function getAllEntities() {
  const subjectsCollection = _database.collection('subjects')
  return subjectsCollection.find().toArray()
}

export async function loadEntities() {
  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)

  const subjectsCollection = _database.collection('subjects')
  const createSubjectIdIndexResult = await subjectsCollection.createIndex(
    { id: 1 },
    { unique: true },
  )
  logger.info(
    `Index for subject document 'id' created`,
    createSubjectIdIndexResult,
  )

  try {
    const subjectsInsertionResult = await subjectsCollection.insertMany(
      registry.entities,
    )
    logger.info(`Subjects has been stored`, subjectsInsertionResult)
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
