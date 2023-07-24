import { config, hideSecrets } from './config'
import { startServer } from './server'
import { createLogger } from './logger'
import { close, connect } from './database'
import { initSubmissions } from './submission/mongoRepository'
import { initRegistry, loadRegistry } from './registry'

const logger = createLogger(__filename)

async function main() {
  logger.info(
    `Starting app with the following config: ${JSON.stringify(
      hideSecrets(config),
      null,
      2,
    )}`,
  )

  const database = await connect(config.db)
  initSubmissions(database)
  initRegistry(database)
  await loadRegistry()
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
