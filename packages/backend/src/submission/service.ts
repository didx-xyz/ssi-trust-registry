import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'
import { EmailClient } from '../email/client'
import { DidResolver } from '../did-resolver/did-resolver'
import { EntityRepository } from '../entity/service'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSubmissionService(
  submissionRepository: SubmissionRepository,
  entityRepository: EntityRepository,
  didResolver: DidResolver,
  emailClient: EmailClient,
): Promise<SubmissionService> {
  return {
    getAllSubmissions: partial(getAllSubmissions, submissionRepository),
    addSubmission: partial(
      addSubmission,
      submissionRepository,
      entityRepository,
      didResolver,
    ),
    generateInvitation: partial(
      generateInvitation,
      submissionRepository,
      emailClient,
    ),
  }
}

export interface SubmissionService {
  generateInvitation: (
    domain: string,
    payload: Record<string, unknown>,
  ) => Promise<InvitationWithUrl>
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (payload: Record<string, unknown>) => Promise<Submission>
}

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  updateSubmission: (submission: Submission) => Promise<Submission>
  findPendingSubmissionByInvitationId: (
    id: string,
  ) => Promise<Submission | null>
  getAllInvitations: () => Promise<Invitation[]>
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  findInvitationById: (id: string) => Promise<Invitation | null>
}

export const SubmissionDto = z
  .object({
    invitationId: z
      .string()
      .openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    dids: z.array(z.string()).openapi({
      example: [
        'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
      ],
    }),
    logo_url: z.string().openapi({
      example:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    }),
    domain: z.string().openapi({
      example: 'www.absa.africa',
    }),
    role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('SubmissionRequest')

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
    emailAddress: z.string().openapi({ example: 'test@example.com' }),
  })
  .openapi('SubmissionInvitationRequest')

export type Invitation = z.infer<typeof Invitation>
export const Invitation = InvitationDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SubmissionInvitationResponse')

export type InvitationWithUrl = z.infer<typeof InvitationWithUrl>
export const InvitationWithUrl = Invitation.extend({
  url: z.string(),
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
  didResolver: DidResolver,
  payload: Record<string, unknown>,
): Promise<Submission> {
  const submissionDto = SubmissionDto.parse(payload)
  if (
    !(await submissionRepository.findInvitationById(submissionDto.invitationId))
  ) {
    throw new Error('Invitation not found')
  }
  for (const did of submissionDto.dids) {
    const didDocument = await didResolver.resolveDid(did)
    if (!didDocument) {
      throw new Error(`DID '${did}' is not resolvable`)
    }
    const existingEntity = await entityRepository.findByDid(did)
    if (
      existingEntity?.invitationId &&
      existingEntity.invitationId !== submissionDto.invitationId
    ) {
      throw new Error(
        `An entity associated with a different invitation already contains the DID '${did}'`,
      )
    }
  }

  const pendingSubmission =
    await submissionRepository.findPendingSubmissionByInvitationId(
      submissionDto.invitationId,
    )

  let submission: Submission
  if (pendingSubmission) {
    submission = {
      ...submissionDto,
      ...pendingSubmission,
      updatedAt: new Date().toISOString(),
    }
    await submissionRepository.updateSubmission(submission)
    logger.info(`Submission ${submission.id} has been updated in the database`)
  } else {
    submission = {
      ...submissionDto,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      state: 'pending' as const,
      updatedAt: new Date().toISOString(),
    }
    await submissionRepository.addSubmission(submission)
    logger.info(`Submission ${submission.id} has been added to the database`)
  }

  return submission
}

async function generateInvitation(
  repository: SubmissionRepository,
  emailClient: EmailClient,
  domain: string,
  payload: Record<string, unknown>,
) {
  const invitationDto = InvitationDto.parse(payload)
  const invitation = {
    ...invitationDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  const invitationUrl = `${domain}/api/submissions/${invitation.id}`
  await repository.addInvitation(invitation)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'Invitation',
    './src/email/templates/invitation.html',
    { invitationUrl },
  )
  return { ...invitation, url: invitationUrl }
}
