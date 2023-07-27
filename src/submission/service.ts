import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import {
  getSubmissionByDid,
  saveSubmission,
  getAllSubmissions as getAll,
} from './mongoRepository'

extendZodWithOpenApi(z)

export async function addSubmission(
  payload: Record<string, unknown>,
): Promise<Submission> {
  const submissionDto = parseSubmission(payload)
  if (await getSubmissionByDid(submissionDto.did)) {
    throw new Error('Submission with the same DID already exisits')
  }
  const submission = {
    ...submissionDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await saveSubmission(submission)
  return submission
}

export async function getAllSubmissions() {
  return (await getAll()).map((d) => ({ ...d, _id: undefined }))
}

function parseSubmission(payload: Record<string, unknown>): SubmissionDto {
  return SubmissionDto.parse(payload)
}

const SubmissionDto = z
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
  .openapi('Enitity')

type SubmissionDto = z.infer<typeof SubmissionDto>

const Submission = SubmissionDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('Submission')

export type Submission = z.infer<typeof Submission>