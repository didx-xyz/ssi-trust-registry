import type { Request, Response } from 'express'
import { InvitationDto, SubmissionDto } from '@ssi-trust-registry/common'
import { createLogger } from '../logger'
import { RequestWithToken } from '../auth/middleware'
import partial from 'lodash.partial'
import { ValidationService } from '../entity/validationService'
import { SubmissionService } from './service'
import { EmailClient } from '../email/client'
import { config } from '../config'
import { FieldError } from '../errors'

const logger = createLogger(__filename)

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
}

export async function createSubmissionController(
  submissionService: SubmissionService,
  validationService: ValidationService,
  emailClient: EmailClient,
): Promise<SubmissionController> {
  return {
    createInvitation: partial(createInvitation, submissionService, emailClient),
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
      emailClient,
    ),
  }
}

async function createInvitation(
  service: SubmissionService,
  emailClient: EmailClient,
  req: Request,
  res: Response,
) {
  const invitationDto = InvitationDto.parse(req.body)
  logger.info(`Creating new invitation for: `, invitationDto.emailAddress)
  const invitation = await service.createInvitation(invitationDto)
  const submitApiUrl = `https://${config.server.url}:${config.server.port}/api/submissions`
  const submitUiUrl = `${config.server.frontendUrl}/submit/${invitation.id}`
  logger.info(`Sending invitation via email to: `, invitation.emailAddress)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'Invitation',
    './src/email/templates/invitation.html',
    {
      submitApiUrl,
      submitUiUrl,
    },
  )
  res.status(201).json({ ...invitation, url: submitUiUrl })
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
  emailClient: EmailClient,
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

  if (state === 'approved') {
    const result = await submissionService.approveSubmission(submission)
    const entityUrl = `${config.server.frontendUrl}/entities/${result.entity.id}`
    logger.info(
      `Sending submission approved email to: `,
      invitation.emailAddress,
    )
    await emailClient.sendMailFromTemplate(
      invitation.emailAddress,
      'Congratulations! Your submission has been approved!',
      './src/email/templates/approved.html',
      {
        entityUrl,
      },
    )
    res.status(200).json(result)
  } else {
    const result = await submissionService.rejectSubmission(submission)
    logger.info(
      `Sending submission rejected email to: `,
      invitation.emailAddress,
    )
    await emailClient.sendMailFromTemplate(
      invitation.emailAddress,
      'Sorry. Your submission has been rejected.',
      './src/email/templates/rejected.html',
      {
        invitationUrl: `${config.server.frontendUrl}/submit/${invitation.id}`,
      },
    )
    res.status(200).json(result)
  }
}
