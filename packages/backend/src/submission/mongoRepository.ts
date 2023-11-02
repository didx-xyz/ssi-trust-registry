import partial from 'lodash.partial'
import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Invitation, Submission, SubmissionRepository } from './service'

const logger = createLogger(__filename)

export async function createSubmissionsRepository(
  database: Db,
): Promise<SubmissionRepository> {
  const submissionCollection = database.collection('submissions')
  const invitationCollection = database.collection('invitations')
  return {
    getAllSubmissions: partial(getAllSubmissions, submissionCollection),
    addSubmission: partial(addSubmission, submissionCollection),
    findPendingSubmissionByInvitationId: partial(
      findPendingSubmissionByInvitationId,
      submissionCollection,
    ),
    getAllInvitations: partial(getAllInvitations, invitationCollection),
    findInvitationById: partial(findInvitationById, invitationCollection),
    addInvitation: partial(addInvitation, invitationCollection),
    updateInvitation: partial(updateInvitation, invitationCollection),
  }
}

async function getAllSubmissions(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Submission.parse(s))
}

async function findPendingSubmissionByInvitationId(
  collection: Collection,
  invitationId: string,
) {
  const submission = await collection.findOne({
    invitationId,
    state: 'pending',
  })
  return submission && Submission.parse(submission)
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

async function updateInvitation(
  collection: Collection,
  invitation: Invitation,
) {
  const result = await collection.updateOne(
    { id: invitation.id },
    { $set: { ...invitation } },
  )
  logger.info(`Invitation updated in the database`, result)
  return invitation
}
