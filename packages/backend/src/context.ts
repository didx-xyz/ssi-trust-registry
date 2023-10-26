import { Db } from 'mongodb'
import { DidResolver } from './did-resolver/did-resolver'
import { createSubmissionsRepository } from './submission/mongoRepository'
import { createSubmissionService } from './submission/service'
import { createSchemaRepository } from './schema/mongoRepository'
import { createSchemaService } from './schema/service'
import { createEntityRepository } from './entity/mongoRepository'
import { createEntityService } from './entity/service'
import { EmailClient } from './email-client'

interface IO {
  database: Db
  didResolver: DidResolver
  emailClient: EmailClient
}

export async function createAppContext(io: IO, domain: string) {
  const { database, didResolver, emailClient } = io
  const submissionRepository = await createSubmissionsRepository(database)
  const submissionService = await createSubmissionService(
    submissionRepository,
    emailClient,
    domain,
  )
  const schemaRepository = await createSchemaRepository(database)
  const schemaService = await createSchemaService(schemaRepository)
  const entityRepository = await createEntityRepository(database)
  const entityService = await createEntityService(
    entityRepository,
    schemaRepository,
    didResolver,
  )

  return {
    submissionRepository,
    submissionService,
    schemaRepository,
    schemaService,
    entityRepository,
    entityService,
  }
}
