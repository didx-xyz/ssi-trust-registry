import 'dotenv/config'
import { startServer } from './server'
import { createLogger } from './logger'
import { config } from './config'

const logger = createLogger(__filename)

function main() {
  logger.info('Starting app with the following config:', config)
  startServer(config)
  process.on('SIGINT', shutdownGracefully())
  process.on('SIGTERM', shutdownGracefully())
}

function shutdownGracefully() {
  return async (signal: string) => {
    logger.info(`Received ${signal}. Stopping the service...`)
    process.exit()
  }
}

main()
