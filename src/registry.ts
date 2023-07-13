import fs from 'node:fs/promises'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export async function getRegistry() {
  const registryContent = await fs.readFile('./src/db/registry.json', {
    encoding: 'utf8',
  })
  return JSON.parse(registryContent)
}

const EntityShema = z
  .object({
    id: z.string().openapi({ example: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8' }),
    name: z.string().openapi({ example: 'Absa' }),
    did: z.string().openapi({ example: 'did:sov:2NPnMDv5Lh57gVZ3p3SYu3' }),
    logo_url: z.string().openapi({
      example:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    }),
    domain: z.string().openapi({
      example: 'www.absa.africa',
    }),
    registered_at: z
      .string()
      .datetime()
      .openapi({ example: '2023-05-24T18:14:24' }),
    updated_at: z
      .string()
      .datetime()
      .openapi({ example: '2023-05-24T18:14:24' }),
    role: z.enum(['issuer', 'verifier']).openapi({ example: 'issuer' }),
    credentials: z
      .array(z.string())
      .openapi({ example: ['2NPnMDv5Lh57gVZ3p3SYu3:3:CL:152537:tag1'] }),
  })
  .openapi('Enitity')

export const RegistrySchema = z.object({ entities: z.array(EntityShema) })
