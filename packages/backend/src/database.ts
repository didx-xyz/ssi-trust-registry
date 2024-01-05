import { MongoClient } from 'mongodb'
import { createLogger } from './logger'

const logger = createLogger(__filename)

let client: MongoClient

interface DbConfig {
  connectionString: string
  name: string
}

export async function connect(config: DbConfig) {
  const { connectionString, name } = config
  logger.info('Connecting to database...')
  client = new MongoClient(connectionString)
  await client.connect()
  const database = client.db(name)
  logger.info(`Connected to database '${name}'`)
  logger.debug(`Database stats:`, await database.stats())
  return database
}

export async function createSession() {
  return client.startSession()
}

export function close() {
  return client.close()
}
