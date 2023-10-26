import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'
import { EmailClient } from '../email/client'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSubmissionService(
  repository: SubmissionRepository,
  emailClient: EmailClient,
  domain: string,
): Promise<SubmissionService> {
  return {
    getAllSubmissions: partial(getAllSubmissions, repository),
    addSubmission: partial(addSubmission, repository),
    generateInvitation: partial(generateInvitation, repository, emailClient),
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
  getAllInvitations: () => Promise<Invitation[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  findSubmissionByDid: (did: string) => Promise<Submission | null>
  findSubmissionByInvitationId: (id: string) => Promise<Submission | null>
  findInvitationById: (id: string) => Promise<Invitation | null>
}

export const SubmissionDto = z
  .object({
    invitationId: z
      .string()
      .openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    did: z.string().openapi({ example: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3' }),
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
  repository: SubmissionRepository,
  payload: Record<string, unknown>,
): Promise<Submission> {
  const submissionDto = SubmissionDto.parse(payload)

  if (!(await repository.findInvitationById(submissionDto.invitationId))) {
    throw new Error('Invitation not found')
  }
  if (
    await repository.findSubmissionByInvitationId(submissionDto.invitationId)
  ) {
    throw new Error('Submission already completed')
  }
  if (await repository.findSubmissionByDid(submissionDto.did)) {
    throw new Error('Submission with the same DID already exists')
  }
  const submission = {
    ...submissionDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await repository.addSubmission(submission)
  logger.info(`Submission ${submission.id} has been added`)
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
