import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../logger'
import { EntityRepository } from '../entity/service'
import { FieldError } from '../errors'
import {
  Invitation,
  InvitationDto,
  Submission,
  SubmissionDto,
} from './interfaces'
import { createId } from '@paralleldrive/cuid2'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submission: Submission) => Promise<Submission>
}
export interface InvitationRepository {
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  getAllInvitations: () => Promise<Invitation[]>
  findInvitationById: (id: string) => Promise<Invitation | null>
}
export interface SubmissionService {
  createInvitation: (invitationDto: InvitationDto) => Promise<Invitation>
  getAllInvitations: () => Promise<Invitation[]>
  getInvitationById: (id: string) => Promise<Invitation>
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submissionDto: SubmissionDto) => Promise<Submission>
}

export async function createSubmissionService(
  submissionRepository: SubmissionRepository,
  invitationRepository: InvitationRepository,
  entityRepository: EntityRepository,
): Promise<SubmissionService> {
  return {
    createInvitation: partial(createInvitation, invitationRepository),
    getAllInvitations: partial(getAllInvitations, invitationRepository),
    getInvitationById: partial(getInvitationById, invitationRepository),
    getAllSubmissions: partial(getAllSubmissions, submissionRepository),
    addSubmission: partial(
      addSubmission,
      submissionRepository,
      invitationRepository,
      entityRepository,
    ),
  }
}

async function getAllSubmissions(repository: SubmissionRepository) {
  return (await repository.getAllSubmissions()).map((s) => ({
    ...s,
    _id: undefined,
  }))
}

async function addSubmission(
  submissionRepository: SubmissionRepository,
  invitationRepository: InvitationRepository,
  entityRepository: EntityRepository,
  submissionDto: SubmissionDto,
): Promise<Submission> {
  const invitation = await invitationRepository.findInvitationById(
    submissionDto.invitationId,
  )
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  for (const did of submissionDto.dids) {
    const existingEntity = await entityRepository.findByDid(did)
    if (existingEntity && existingEntity.id !== invitation.entityId) {
      throw new FieldError(
        `A different entity has already registered the did '${did}'`,
        'dids',
      )
    }
  }

  const submission = {
    ...submissionDto,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    state: 'pending' as const,
    updatedAt: new Date().toISOString(),
  }
  await submissionRepository.addSubmission(submission)
  logger.info(`Submission ${submission.id} has been added to the database`)

  return submission
}

async function createInvitation(
  repository: InvitationRepository,
  invitationDto: InvitationDto,
) {
  const invitation = {
    ...invitationDto,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  await repository.addInvitation(invitation)
  return invitation
}

async function getAllInvitations(repository: InvitationRepository) {
  return (await repository.getAllInvitations()).map((i) => ({
    ...i,
    _id: undefined,
  }))
}

async function getInvitationById(repository: InvitationRepository, id: string) {
  const invitation = await repository.findInvitationById(id)
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  return invitation
}
