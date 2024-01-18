import { Db } from 'mongodb'
import { EmailClient } from './email/client'
import { DidResolver } from './did-resolver/did-resolver'
import {
  createInvitationRepository,
  createSubmissionRepository,
} from './submission/mongoRepository'
import { createEmailService } from './email/service'
import { createSubmissionService } from './submission/service'
import { createSchemaRepository } from './schema/mongoRepository'
import { createSchemaService } from './schema/service'
import { createEntityRepository } from './entity/mongoRepository'
import { createEntityService } from './entity/service'
import { createAuthController } from './auth/controller'
import { createSubmissionController } from './submission/controller'
import { createValidationService } from './entity/validationService'

interface IO {
  database: Db
  didResolver: DidResolver
  emailClient: EmailClient
}

export async function createAppContext(io: IO) {
  const { database, didResolver, emailClient } = io
  const emailService = await createEmailService(emailClient)
  const invitationRepository = await createInvitationRepository(database)
  const submissionRepository = await createSubmissionRepository(database)
  const schemaRepository = await createSchemaRepository(database)
  const entityRepository = await createEntityRepository(database)
  const validationService = await createValidationService(
    schemaRepository,
    didResolver,
  )
  const submissionService = await createSubmissionService(
    submissionRepository,
    invitationRepository,
    entityRepository,
  )
  const schemaService = await createSchemaService(schemaRepository)
  const entityService = await createEntityService(
    entityRepository,
    validationService,
  )

  const authController = await createAuthController()
  const submissionController = await createSubmissionController(
    submissionService,
    validationService,
    emailService,
  )

  return {
    emailService,
    invitationRepository,
    submissionRepository,
    submissionService,
    submissionController,
    schemaRepository,
    schemaService,
    entityRepository,
    entityService,
    authController,
  }
}
