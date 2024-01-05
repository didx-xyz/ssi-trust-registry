import type { Request, Response } from 'express'
import {
  Entity,
  FieldError,
  Invitation,
  InvitationDto,
  Submission,
  SubmissionDto,
} from '@ssi-trust-registry/common'
import { z } from 'zod'
import { RouteConfig } from '@asteasolutions/zod-to-openapi'
import partial from 'lodash.partial'
import { RequestWithToken } from '../auth/middleware'
import { ValidationService } from '../entity/validationService'
import { getSubmitUrls } from '../email/helpers'
import { EmailService } from '../email/service'
import { createLogger } from '../logger'
import { createSession } from '../database'
import { SubmissionService } from './service'

const logger = createLogger(__filename)

const UpdateSubmissionRequestSchema = z.object({
  submission: Submission,
  entity: Entity,
})

const CreateInvitationResponseSchema = z.object({
  emailAddress: z.string().openapi({
    example: 'test@example.com',
  }),
  id: z.string().openapi({
    example: 'tz4a98xxat96iws9zmbrgj3a',
  }),
  createdAt: z.string().openapi({
    example: '2023-05-24T18:14:24',
  }),
  url: z.string().openapi({
    example: 'http://localhost:3001/submit/tz4a98xxat96iws9zmbrgj3a',
  }),
})

export interface SubmissionController {
  createInvitation: (req: RequestWithToken, res: Response) => Promise<void>
  getAllInvitations: (req: RequestWithToken, res: Response) => Promise<void>
  getInvitationById: (req: Request, res: Response) => Promise<void>
  createSubmission: (req: Request, res: Response) => Promise<void>
  getAllSubmissions: (req: RequestWithToken, res: Response) => Promise<void>
  getSubmissionById: (req: RequestWithToken, res: Response) => Promise<void>
  getSubmissionsByInvitationId: (
    req: RequestWithToken,
    res: Response,
  ) => Promise<void>
  updateSubmissionState: (req: RequestWithToken, res: Response) => Promise<void>
  resendInvitation: (req: RequestWithToken, res: Response) => Promise<void>
  getRouteConfigDocs: () => RouteConfig[]
}

export async function createSubmissionController(
  submissionService: SubmissionService,
  validationService: ValidationService,
  emailService: EmailService,
): Promise<SubmissionController> {
  return {
    createInvitation: partial(
      createInvitation,
      submissionService,
      emailService,
    ),
    getAllInvitations: partial(getAllInvitations, submissionService),
    getInvitationById: partial(getInvitationById, submissionService),
    createSubmission: partial(
      createSubmission,
      submissionService,
      validationService,
    ),
    getAllSubmissions: partial(getAllSubmissions, submissionService),
    getSubmissionById: partial(getSubmissionById, submissionService),
    getSubmissionsByInvitationId: partial(
      getSubmissionsByInvitationId,
      submissionService,
    ),
    updateSubmissionState: partial(
      updateSubmissionState,
      submissionService,
      validationService,
      emailService,
    ),
    resendInvitation: partial(
      resendInvitation,
      submissionService,
      emailService,
    ),
    getRouteConfigDocs,
  }
}

async function createInvitation(
  service: SubmissionService,
  emailService: EmailService,
  req: Request,
  res: Response,
) {
  const invitationDto = InvitationDto.parse(req.body)
  logger.info(`Creating new invitation for: `, invitationDto.emailAddress)
  const session = await createSession()
  try {
    session.startTransaction()
    const invitation = await service.createInvitation(invitationDto, {
      session,
    })
    const { submitUiUrl } = getSubmitUrls(invitation)
    await emailService.sendInvitationEmail(invitation)
    res.status(201).json({ ...invitation, url: submitUiUrl })
    await session.commitTransaction()
  } catch (error) {
    logger.error('Error creating invitation, aborting transaction')
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

async function resendInvitation(
  service: SubmissionService,
  emailService: EmailService,
  req: Request,
  res: Response,
) {
  const invitation = await service.getInvitationById(req.params.id)
  const { submitUiUrl } = getSubmitUrls(invitation)
  await emailService.sendInvitationEmail(invitation)
  res.status(200).json({ ...invitation, url: submitUiUrl })
}

async function getAllInvitations(
  service: SubmissionService,
  req: RequestWithToken,
  res: Response,
) {
  logger.info(`Getting all invitations`)
  const invitations = await service.getAllInvitations()
  res.status(200).json(invitations)
}

async function getInvitationById(
  service: SubmissionService,
  req: Request,
  res: Response,
) {
  logger.info(`Getting invitation by id: `, req.params.id)
  const submission = await service.getInvitationById(req.params.id)
  res.status(200).json(submission)
}

async function createSubmission(
  submissionService: SubmissionService,
  validationService: ValidationService,
  req: Request,
  res: Response,
) {
  const submissionDto = SubmissionDto.parse(req.body)
  logger.info(`Processing submission:`, submissionDto)
  try {
    await validationService.validateDids(submissionDto.dids)
  } catch (error) {
    throw new FieldError((error as Error).message, 'dids')
  }
  try {
    await validationService.validateSchemas(submissionDto.credentials)
  } catch (error) {
    throw new FieldError((error as Error).message, 'credentials')
  }
  const submission = await submissionService.addSubmission(submissionDto)
  res.status(201).json(submission)
}

async function getAllSubmissions(
  service: SubmissionService,
  req: RequestWithToken,
  res: Response,
) {
  logger.info(`Getting all submissions`)
  const submissions = await service.getAllSubmissions()
  res.status(200).json(submissions)
}

async function getSubmissionById(
  service: SubmissionService,
  req: RequestWithToken,
  res: Response,
) {
  logger.info(`Getting submissions by id: `, req.params.id)
  const submission = await service.getSubmissionById(req.params.id)
  res.status(200).json(submission)
}

async function getSubmissionsByInvitationId(
  service: SubmissionService,
  req: RequestWithToken,
  res: Response,
) {
  logger.info(`Getting all submissions for invitation: `, req.params.id)
  const submissions = await service.getSubmissionsByInvitationId(req.params.id)
  res.status(200).json(submissions)
}

async function updateSubmissionState(
  submissionService: SubmissionService,
  validationService: ValidationService,
  emailService: EmailService,
  req: RequestWithToken,
  res: Response,
) {
  const { state } = req.body
  if (state !== 'approved' && state !== 'rejected') {
    throw new Error(`Invalid submission state: ${state}`)
  }
  const submission = await submissionService.getSubmissionById(req.params.id)
  if (submission.state !== 'pending') {
    throw new Error(`Submission already processed: ${submission.state}`)
  }
  const invitation = await submissionService.getInvitationById(
    submission.invitationId,
  )
  await validationService.validateDids(submission.dids)
  await validationService.validateSchemas(submission.credentials)
  const session = await createSession()
  try {
    session.startTransaction()
    let result
    if (state === 'approved') {
      result = await submissionService.approveSubmission(submission, {
        session,
      })
      await emailService.sendApprovalEmail(invitation, result.entity.id)
    } else {
      result = await submissionService.rejectSubmission(submission, { session })
      await emailService.sendRejectionEmail(invitation)
    }
    console.log('committing transaction')
    res.status(200).json(result)
    await session.commitTransaction()
  } catch (error) {
    logger.error('Error updating submission state, aborting transaction')
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

function getRouteConfigDocs(): RouteConfig[] {
  return [
    {
      method: 'get',
      path: '/submissions',
      summary: 'Returns submissions list',
      request: {},
      responses: {
        200: {
          description: 'List of submissions',
          content: {
            'application/json': {
              schema: z.array(Submission),
            },
          },
        },
      },
    },
    {
      method: 'post',
      path: '/submissions',
      summary: 'Creates submission',
      request: { params: Submission },
      responses: {
        200: {
          description: 'Created submission',
          content: {
            'application/json': {
              schema: Submission,
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/submissions/:id',
      summary: 'Returns single submission',
      request: {},
      responses: {
        200: {
          description: 'Single submission',
          content: {
            'application/json': {
              schema: Submission,
            },
          },
        },
      },
    },
    {
      method: 'put',
      path: '/submissions/:id',
      summary: 'Updates single submission',
      request: { params: UpdateSubmissionRequestSchema },
      responses: {
        200: {
          description: 'Updated submission',
          content: {
            'application/json': {
              schema: Submission,
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/invitations',
      summary: 'Returns invitations list',
      request: {},
      responses: {
        200: {
          description: 'List of invitations',
          content: {
            'application/json': {
              schema: z.array(Invitation),
            },
          },
        },
      },
    },
    {
      method: 'post',
      path: '/invitations',
      summary: 'Create invitation',
      request: { params: InvitationDto },
      responses: {
        200: {
          description: 'Created invitation',
          content: {
            'application/json': {
              schema: CreateInvitationResponseSchema,
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/invitations/:id',
      summary: 'Returns single invitation',
      request: {},
      responses: {
        200: {
          description: 'Single invitation',
          content: {
            'application/json': {
              schema: Invitation,
            },
          },
        },
      },
    },
    {
      method: 'get',
      path: '/invitations/:id/submissions',
      summary: 'Returns submission by invitation id',
      request: {},
      responses: {
        200: {
          description: 'Submission by invitation id',
          content: {
            'application/json': {
              schema: z.array(Submission),
            },
          },
        },
      },
    },
    {
      method: 'post',
      path: '/invitations/:id/resend',
      summary: 'Resend invitation',
      request: {},
      responses: {
        200: {
          description: 'Invitation',
          content: {
            'application/json': {
              schema: CreateInvitationResponseSchema,
            },
          },
        },
      },
    },
  ]
}
