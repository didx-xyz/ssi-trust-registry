import { MongoClient } from 'mongodb'

export async function connectToDatabase() {
  const mongoConnectionString = `mongodb://localhost:3005`
  const client = new MongoClient(mongoConnectionString)
  try {
    const database = client.db('test_registry')
    console.log(await database.stats())
    return database
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}
