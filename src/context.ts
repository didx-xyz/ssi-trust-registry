import { Db } from 'mongodb'
import { createSubmissionsRepository } from './submission/mongoRepository'
import { createSubmissionService } from './submission/service'
import { createSchemaRepository } from './schema/mongoRepository'
import { createSchemaService } from './schema/service'
import { createEntityRepository } from './entity/mongoRepository'
import { createEntityService } from './entity/service'

interface IO {
  database: Db
}

export async function createAppContext(io: IO) {
  const { database } = io
  const submissionRepository = await createSubmissionsRepository(database)
  const submissionService = await createSubmissionService(submissionRepository)
  const schemaRepository = await createSchemaRepository(database)
  const schemaService = await createSchemaService(schemaRepository)
  const entityRepository = await createEntityRepository(database)
  const entityService = await createEntityService(entityRepository)

  return {
    submissionRepository,
    submissionService,
    schemaRepository,
    schemaService,
    entityRepository,
    entityService,
  }
}
