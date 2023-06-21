import { startServer } from './server'
import { createLogger } from './logger'

const logger = createLogger(__filename)

function main() {
  startServer()
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
