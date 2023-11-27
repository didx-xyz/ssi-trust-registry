import partial from 'lodash.partial'
import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Invitation, Submission } from './interfaces'
import { InvitationRepository, SubmissionRepository } from './service'

const logger = createLogger(__filename)

export async function createSubmissionRepository(
  database: Db,
): Promise<SubmissionRepository> {
  const submissionCollection = database.collection('submissions')
  return {
    getAllSubmissions: partial(getAllSubmissions, submissionCollection),
    findSubmissionsByInvitationId: partial(
      findSubmissionsByInvitationId,
      submissionCollection,
    ),
    addSubmission: partial(addSubmission, submissionCollection),
  }
}

export async function createInvitationRepository(
  database: Db,
): Promise<InvitationRepository> {
  const invitationCollection = database.collection('invitations')
  return {
    addInvitation: partial(addInvitation, invitationCollection),
    getAllInvitations: partial(getAllInvitations, invitationCollection),
    findInvitationById: partial(findInvitationById, invitationCollection),
  }
}

async function getAllSubmissions(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Submission.parse(s))
}

async function findSubmissionsByInvitationId(
  collection: Collection,
  id: string,
) {
  const result = await collection
    .find({ invitationId: id })
    .sort({ createdAt: -1 })
    .toArray()
  return result.map((s) => Submission.parse(s))
}

async function addSubmission(collection: Collection, submission: Submission) {
  const result = await collection.insertOne({ ...submission })
  logger.info(`Submission inserted to the database`, result)
  return submission
}

async function getAllInvitations(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Invitation.parse(s))
}

async function findInvitationById(collection: Collection, id: string) {
  const invitation = await collection.findOne({ id })
  return invitation && Invitation.parse(invitation)
}

async function addInvitation(collection: Collection, invitation: Invitation) {
  const result = await collection.insertOne({ ...invitation })
  logger.info(`Invitation inserted to the database`, result)
  return invitation
}
