import { config } from './config'
import { startServer } from './server'
import { createLogger } from './logger'
import { closeConnection, connectToDatabase } from './database'
import { initSubmissions } from './submission/mongoRepository'

const logger = createLogger(__filename)

async function main() {
  logger.info(
    `Starting app with the following config: ${JSON.stringify(
      config,
      null,
      2,
    )}`,
  )

  const database = await connectToDatabase(config.db)
  initSubmissions(database)
  startServer(config.server)
  process.on('SIGINT', shutdownGracefully())
  process.on('SIGTERM', shutdownGracefully())
}

function shutdownGracefully() {
  return async (signal: string) => {
    logger.info(`Received ${signal}. Stopping the service...`)
    await closeConnection()
    process.exit()
  }
}

main()
