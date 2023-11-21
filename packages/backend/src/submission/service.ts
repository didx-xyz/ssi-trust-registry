import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createId } from '@paralleldrive/cuid2'
import { createLogger } from '../logger'
import { EmailClient } from '../email/client'
import { DidResolver } from '../did-resolver/did-resolver'
import { EntityDto, EntityRepository } from '../entity/service'
import { SchemaRepository } from '../schema/service'
import { FieldError } from '../errors'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSubmissionService(
  submissionRepository: SubmissionRepository,
  entityRepository: EntityRepository,
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
  emailClient: EmailClient,
): Promise<SubmissionService> {
  return {
    getAllSubmissions: partial(getAllSubmissions, submissionRepository),
    addSubmission: partial(
      addSubmission,
      submissionRepository,
      entityRepository,
      schemaRepository,
      didResolver,
    ),
    generateInvitation: partial(
      generateInvitation,
      submissionRepository,
      emailClient,
    ),
    getInvitationById: partial(getInvitationById, submissionRepository),
  }
}

export interface SubmissionService {
  generateInvitation: (
    backendUrl: string,
    frontendUrl: string,
    payload: Record<string, unknown>,
  ) => Promise<InvitationWithUrl>
  getInvitationById: (id: string) => Promise<Invitation>
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (payload: Record<string, unknown>) => Promise<Submission>
}

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  findPendingSubmissionByInvitationId: (
    id: string,
  ) => Promise<Submission | null>
  getAllInvitations: () => Promise<Invitation[]>
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  findInvitationById: (id: string) => Promise<Invitation | null>
}

export const SubmissionDto = EntityDto.extend({
  invitationId: z.string().openapi({ example: 'tz4a98xxat96iws9zmbrgj3a' }),
})

export type SubmissionDto = z.infer<typeof SubmissionDto>
export type Submission = z.infer<typeof Submission>

export const Submission = SubmissionDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  state: z
    .enum(['pending', 'approved', 'rejected'])
    .openapi({ example: 'pending' }),
}).openapi('SubmissionResponse')

export type InvitationDto = z.infer<typeof InvitationDto>
export const InvitationDto = z
  .object({
    entityId: z
      .string()
      .optional()
      .openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    emailAddress: z.string().email().openapi({ example: 'test@example.com' }),
  })
  .openapi('InvitationRequest')

export type Invitation = z.infer<typeof Invitation>
export const Invitation = InvitationDto.extend({
  id: z.string().openapi({ example: 'tz4a98xxat96iws9zmbrgj3a' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('InvitationResponse')

export type InvitationWithUrl = z.infer<typeof InvitationWithUrl>
export const InvitationWithUrl = Invitation.extend({
  apiUrl: z.string(),
  uiUrl: z.string(),
})

async function getAllSubmissions(repository: SubmissionRepository) {
  return (await repository.getAllSubmissions()).map((s) => ({
    ...s,
    _id: undefined,
  }))
}

async function addSubmission(
  submissionRepository: SubmissionRepository,
  entityRepository: EntityRepository,
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
  payload: Record<string, unknown>,
): Promise<Submission> {
  const submissionDto = SubmissionDto.parse(payload)
  const invitation = await submissionRepository.findInvitationById(
    submissionDto.invitationId,
  )
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  for (const did of submissionDto.dids) {
    const didDocument = await didResolver.resolveDid(did)
    if (!didDocument) {
      throw new FieldError(`DID '${did}' is not resolvable`, 'dids')
    }
    const existingEntity = await entityRepository.findByDid(did)
    if (existingEntity && existingEntity.id !== invitation.entityId) {
      throw new FieldError(
        `A different entity has already registered the did '${did}'`,
        'dids',
      )
    }
  }
  for (const schemaId of submissionDto.credentials) {
    const registrySchema = await schemaRepository.findBySchemaId(schemaId)
    console.log(registrySchema, schemaId)
    if (!registrySchema) {
      throw new FieldError(
        `Schema '${schemaId}' is not present in the trust registry`,
        'credentials',
      )
    }
  }

  const submission = {
    ...submissionDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    state: 'pending' as const,
    updatedAt: new Date().toISOString(),
  }
  await submissionRepository.addSubmission(submission)
  logger.info(`Submission ${submission.id} has been added to the database`)

  return submission
}

async function getInvitationById(repository: SubmissionRepository, id: string) {
  const invitation = await repository.findInvitationById(id)
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  return invitation
}

async function generateInvitation(
  repository: SubmissionRepository,
  emailClient: EmailClient,
  backendUrl: string,
  frontendUrl: string,
  payload: Record<string, unknown>,
) {
  const invitationDto = InvitationDto.parse(payload)
  const invitation = {
    ...invitationDto,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  const invitationApiUrl = `${backendUrl}/api/submissions/${invitation.id}`
  const invitationUiUrl = `${frontendUrl}/submission/${invitation.id}`
  await repository.addInvitation(invitation)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'Invitation',
    './src/email/templates/invitation.html',
    { invitationApiUrl, invitationUiUrl },
  )
  return { ...invitation, apiUrl: invitationApiUrl, uiUrl: invitationUiUrl }
}
