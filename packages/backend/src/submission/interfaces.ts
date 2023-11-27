import { z } from 'zod'
import { EntityDto } from '../entity/service'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

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
