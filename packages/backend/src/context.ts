import { Db } from 'mongodb'
import { DidResolver } from './did-resolver/did-resolver'
import { createSubmissionsRepository } from './submission/mongoRepository'
import { createSubmissionService } from './submission/service'
import { createSchemaRepository } from './schema/mongoRepository'
import { createSchemaService } from './schema/service'
import { createEntityRepository } from './entity/mongoRepository'
import { createEntityService } from './entity/service'
import { EmailClient } from './email/client'
import { createAuthController } from './auth/controller'

interface IO {
  database: Db
  didResolver: DidResolver
  emailClient: EmailClient
}

export async function createAppContext(io: IO) {
  const { database, didResolver, emailClient } = io
  const submissionRepository = await createSubmissionsRepository(database)
  const schemaRepository = await createSchemaRepository(database)
  const entityRepository = await createEntityRepository(database)
  const submissionService = await createSubmissionService(
    submissionRepository,
    entityRepository,
    schemaRepository,
    didResolver,
    emailClient,
  )
  const schemaService = await createSchemaService(schemaRepository)
  const entityService = await createEntityService(
    entityRepository,
    schemaRepository,
    didResolver,
  )

  const authController = await createAuthController()

  return {
    submissionRepository,
    submissionService,
    schemaRepository,
    schemaService,
    entityRepository,
    entityService,
    authController,
  }
}
