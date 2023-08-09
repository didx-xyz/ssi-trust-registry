import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export async function createSubmissionService(
  repository: SubmissionRepository,
): Promise<SubmissionService> {
  return {
    getAllSubmissions: partial(getAllSubmissions, repository),
    addSubmission: partial(addSubmission, repository),
  }
}

export interface SubmissionService {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (payload: Record<string, unknown>) => Promise<Submission>
}

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  findSubmissionByDid: (did: string) => Promise<Submission | null>
  deleteAll: () => Promise<boolean>
}

export const SubmissionDto = z
  .object({
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
  if (await repository.findSubmissionByDid(submissionDto.did)) {
    throw new Error('Submission with the same DID already exisits')
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
