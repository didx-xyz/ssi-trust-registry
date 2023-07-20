import { MongoClient } from 'mongodb'

let client: MongoClient

export async function connectToDatabase() {
  const mongoConnectionString = `mongodb://localhost:3005`
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
