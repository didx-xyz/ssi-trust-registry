import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function parseSubmission(
  payload: Record<string, unknown>
): SubmissionSchema {
  return SubmissionSchema.parse(payload)
}

const SubmissionSchema = z
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

type SubmissionSchema = z.infer<typeof SubmissionSchema>
