import { config, hideSecrets } from './config'
import { startServer } from './server'
import { createLogger } from './logger'
import { close, connect } from './database'
import { createSchemaService } from './schema/service'
import { createEntityRepository } from './entity/mongoRepository'
import { createEntityService } from './entity/service'
import { createSchemaRepository } from './schema/mongoRepository'
import { createSubmissionService } from './submission/service'
import { createSubmissionsRepository } from './submission/mongoRepository'

const logger = createLogger(__filename)

async function main() {
  logger.info(`Starting app with the following config`, hideSecrets(config))

  const database = await connect(config.db)

  const submissionRepository = await createSubmissionsRepository(database)
  const submissionService = await createSubmissionService(submissionRepository)
  const schemaRepository = await createSchemaRepository(database)
  const schemaService = await createSchemaService(schemaRepository)
  const entityRepository = await createEntityRepository(database)
  const entityService = await createEntityService(entityRepository)

  await schemaService.loadSchemas()
  await entityService.loadEntities()

  const context = {
    submissionService,
    entityService,
    schemaService,
  }

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
