import { startServer } from './server'

function main() {
  startServer()
  process.on('SIGINT', shutdownGracefully())
  process.on('SIGTERM', shutdownGracefully())
}

function shutdownGracefully() {
  return async (signal: string) => {
    console.log(`Received ${signal}. Stopping the service...`)
    process.exit()
  }
}

main()
