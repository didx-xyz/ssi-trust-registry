import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const exampleSchemaDto = {
  schemaId:
    'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
  name: 'Digital Identity',
}

export type SchemaDto = z.infer<typeof SchemaDto>
export const SchemaDto = z
  .object({
    schemaId: z.string().openapi({ example: exampleSchemaDto.schemaId }),
    name: z.string().openapi({ example: exampleSchemaDto.name }),
  })
  .openapi('SchemaRequest')

export type Schema = z.infer<typeof Schema>
export const Schema = SchemaDto.extend({
  createdAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
  updatedAt: z.string().datetime().openapi({ example: '2023-05-24T18:14:24' }),
}).openapi('SchemaResponse')
