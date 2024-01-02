import partial from 'lodash.partial'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { ClientSession } from 'mongodb'
import {
  Entity,
  FieldError,
  Invitation,
  InvitationDto,
  Submission,
  SubmissionDto,
} from '@ssi-trust-registry/common'
import { createId } from '@paralleldrive/cuid2'
import { createLogger } from '../logger'
import { EntityRepository } from '../entity/service'

const logger = createLogger(__filename)
extendZodWithOpenApi(z)

export interface SubmissionRepository {
  getAllSubmissions: () => Promise<Submission[]>
  addSubmission: (submission: Submission) => Promise<Submission>
  updateSubmission: (
    submission: Submission,
    config?: { session?: ClientSession; newDatestamps?: boolean },
  ) => Promise<Submission>
  findSubmissionById: (id: string) => Promise<Submission | null>
  findSubmissionsByInvitationId: (id: string) => Promise<Submission[]>
}
export interface InvitationRepository {
  addInvitation: (invitation: Invitation) => Promise<Invitation>
  updateInvitation: (
    invitation: Invitation,
    config?: { session?: ClientSession },
  ) => Promise<Invitation>
  deleteInvitation: (id: string) => Promise<void>
  getAllInvitations: () => Promise<Invitation[]>
  findInvitationById: (id: string) => Promise<Invitation | null>
}

export interface SubmissionService {
  createInvitation: (invitationDto: InvitationDto) => Promise<Invitation>
  deleteInvitation: (id: string) => Promise<void>
  getAllInvitations: () => Promise<Invitation[]>
  getInvitationById: (id: string) => Promise<Invitation>
  getSubmissionById: (id: string) => Promise<Submission>
  getAllSubmissions: () => Promise<Submission[]>
  getSubmissionsByInvitationId: (id: string) => Promise<Submission[]>
  addSubmission: (submissionDto: SubmissionDto) => Promise<Submission>
  approveSubmission: (
    submission: Submission,
    config?: { session?: ClientSession },
  ) => Promise<{ submission: Submission; entity: Entity }>
  rejectSubmission: (
    submission: Submission,
    config?: { session?: ClientSession },
  ) => Promise<Submission>
  updateSubmission: (
    submission: Submission,
    config?: { session?: ClientSession; newDatestamps?: boolean },
  ) => Promise<Submission>
}

export async function createSubmissionService(
  submissionRepository: SubmissionRepository,
  invitationRepository: InvitationRepository,
  entityRepository: EntityRepository,
): Promise<SubmissionService> {
  return {
    createInvitation: partial(createInvitation, invitationRepository),
    deleteInvitation: partial(deleteInvitation, invitationRepository),
    getAllInvitations: partial(getAllInvitations, invitationRepository),
    getInvitationById: partial(getInvitationById, invitationRepository),
    getAllSubmissions: partial(getAllSubmissions, submissionRepository),
    getSubmissionById: partial(getSubmissionById, submissionRepository),
    getSubmissionsByInvitationId: partial(
      getSubmissionsByInvitationId,
      submissionRepository,
      invitationRepository,
    ),
    addSubmission: partial(
      addSubmission,
      submissionRepository,
      invitationRepository,
      entityRepository,
    ),
    approveSubmission: partial(
      approveSubmission,
      submissionRepository,
      invitationRepository,
      entityRepository,
    ),
    rejectSubmission: partial(rejectSubmission, submissionRepository),
    updateSubmission: partial(updateSubmission, submissionRepository),
  }
}

async function getAllSubmissions(repository: SubmissionRepository) {
  return (await repository.getAllSubmissions()).map((s) => ({
    ...s,
    _id: undefined,
  }))
}

async function getSubmissionById(repository: SubmissionRepository, id: string) {
  const submission = await repository.findSubmissionById(id)
  if (!submission) {
    throw new Error('Submission not found')
  }
  return submission
}

async function getSubmissionsByInvitationId(
  submissionRepository: SubmissionRepository,
  invitationRepository: InvitationRepository,
  id: string,
) {
  const invitation = await invitationRepository.findInvitationById(id)
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  return (await submissionRepository.findSubmissionsByInvitationId(id)).map(
    (s) => ({
      ...s,
      _id: undefined,
    }),
  )
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

async function approveSubmission(
  submissionRepository: SubmissionRepository,
  invitationRepository: InvitationRepository,
  entityRepository: EntityRepository,
  submission: Submission,
  config: { session?: ClientSession } = {},
): Promise<{ submission: Submission; entity: Entity }> {
  const invitation = await invitationRepository.findInvitationById(
    submission.invitationId,
  )
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  for (const did of submission.dids) {
    const existingEntity = await entityRepository.findByDid(did)
    if (existingEntity && existingEntity.id !== invitation.entityId) {
      throw new Error(
        `A different entity has already registered the did '${did}'`,
      )
    }
  }
  const reviewedSubmission = await submissionRepository.updateSubmission(
    {
      ...submission,
      state: 'approved',
    },
    config,
  )
  logger.info(`Submission ${submission.id} has been approved in the database`)

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    id: _,
    state,
    createdAt,
    updatedAt,
    invitationId,
    ...entityData
  } = reviewedSubmission
  /* eslint-enable @typescript-eslint/no-unused-vars */
  let entity: Entity
  if (!invitation.entityId) {
    const date = new Date().toISOString()
    const newEntity = {
      ...entityData,
      id: uuidv4(),
      createdAt: date,
      updatedAt: date,
    }
    entity = await entityRepository.addEntity(newEntity, config)
    await invitationRepository.updateInvitation(
      {
        ...invitation,
        entityId: entity.id,
      },
      config,
    )
    logger.info(`Entity ${entity.id} has been inserted to the database`)
  } else {
    const existingEntity = await entityRepository.findById(invitation.entityId)
    if (!existingEntity) {
      throw new Error('Existing entity not found')
    }
    const updatedEntity = {
      ...existingEntity,
      ...entityData,
      updatedAt: new Date().toISOString(),
    }
    entity = await entityRepository.updateEntity(updatedEntity, config)
    logger.info(`Entity ${entity.id} has been updated in the database`)
  }

  return { submission: reviewedSubmission, entity }
}

async function rejectSubmission(
  submissionRepository: SubmissionRepository,
  submission: Submission,
  config: { session?: ClientSession } = {},
): Promise<Submission> {
  const reviewedSubmission = await submissionRepository.updateSubmission(
    {
      ...submission,
      state: 'rejected',
    },
    config,
  )
  logger.info(`Submission ${submission.id} has been rejected in the database`)
  return reviewedSubmission
}

async function updateSubmission(
  repository: SubmissionRepository,
  submission: Submission,
  config: { session?: ClientSession; newDatestamps?: boolean } = {
    newDatestamps: true,
  },
): Promise<Submission> {
  const updatedSubmission = await repository.updateSubmission(
    submission,
    config,
  )
  logger.info(`Submission ${submission.id} has been updated in the database`)
  return updatedSubmission
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

async function deleteInvitation(
  repository: InvitationRepository,
  id: string,
): Promise<void> {
  await repository.deleteInvitation(id)
  logger.info(`Invitation ${id} has been deleted from the database`)
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
