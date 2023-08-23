import fs from 'node:fs/promises'
import { config, hideSecrets } from './config'
import { startServer } from './server'
import { createLogger } from './logger'
import { close, connect } from './database'
import { createAppContext } from './context'

const logger = createLogger(__filename)

async function main() {
  logger.info(`Starting app with the following config`, hideSecrets(config))

  const database = await connect(config.db)
  const context = await createAppContext({ database })

  const registryContent = await fs.readFile('./src/data/registry.json', {
    encoding: 'utf8',
  })
  const registry = JSON.parse(registryContent)
  await context.schemaService.loadSchemas(registry.schemas)
  await context.entityService.loadEntities(registry.entities)

  startServer(config.server, context)
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
