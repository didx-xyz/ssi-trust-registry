import { MongoClient } from 'mongodb'

let client: MongoClient

interface DbConfig {
  connectionString: string
}

export async function connectToDatabase(config: DbConfig) {
  const mongoConnectionString = config.connectionString
  client = new MongoClient(mongoConnectionString)
  console.log('Connecting to database')
  await client.connect()
  console.log('Database connected')
  const database = client.db('test_registry')
  console.log(await database.stats())
  return database
}

export function closeConnection() {
  return client.close()
}
