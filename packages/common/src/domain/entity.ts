import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const exampleEntityDto = {
  id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
  name: 'Absa',
  logo_url: 'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
  domain: 'www.absa.africa',
  dids: [
    'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
  ],
  role: ['issuer' as const, 'verifier' as const],
  credentials: [
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
  ],
}

export type EntityDto = z.infer<typeof EntityDto>
export const EntityDto = z
  .object({
    name: z.string().openapi({ example: exampleEntityDto.name }),
    dids: z.array(z.string()).openapi({ example: exampleEntityDto.dids }),
    logo_url: z.string().openapi({ example: exampleEntityDto.logo_url }),
    domain: z.string().openapi({ example: exampleEntityDto.domain }),
    role: z
      .array(z.enum(['issuer', 'verifier']))
      .openapi({ example: exampleEntityDto.role }),
    credentials: z
      .array(z.string())
      .openapi({ example: exampleEntityDto.credentials }),
  })
  .openapi('EntityRequest')

export type Entity = z.infer<typeof Entity>
export const Entity = EntityDto.extend({
  id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('EntityResponse')
