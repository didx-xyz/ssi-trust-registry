import { config, hideSecrets } from './config'
import { startServer } from './server'
import { createLogger } from './logger'
import { close, connect } from './database'
import { initSubmissions } from './submission/mongoRepository'
import { initSchemas } from './schema/mongoRepository'
import { loadSchemas } from './schema/service'
import { initEntities } from './entity/mongoRepository'
import { loadEntities } from './entity/service'

const logger = createLogger(__filename)

async function main() {
  logger.info(`Starting app with the following config`, hideSecrets(config))

  const database = await connect(config.db)
  initSubmissions(database)
  await initSchemas(database)
  await initEntities(database)
  await loadSchemas()
  await loadEntities()
  startServer(config.server)
  process.on('SIGINT', shutdownGracefully())
  process.on('SIGTERM', shutdownGracefully())
}

function shutdownGracefully() {
  return async (signal: string) => {
    logger.info(`Received ${signal}. Stopping the service...`)
    await close()
    process.exit()
  }
}

main()
