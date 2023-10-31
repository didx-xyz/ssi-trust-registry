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
    findSubmissionByDid: partial(findSubmissionByDid, submissionCollection),
    findSubmissionByInvitationId: partial(
      findSubmissionByInvitationId,
      submissionCollection,
    ),
    addSubmission: partial(addSubmission, submissionCollection),
    getAllInvitations: partial(getAllInvitations, invitationCollection),
    findInvitationById: partial(findInvitationById, invitationCollection),
    addInvitation: partial(addInvitation, invitationCollection),
  }
}

async function getAllSubmissions(collection: Collection) {
  const result = await collection.find().toArray()
  return result.map((s) => Submission.parse(s))
}

async function findSubmissionByDid(collection: Collection, did: string) {
  const submission = await collection.findOne({ did })
  return submission && Submission.parse(submission)
}

async function findSubmissionByInvitationId(
  collection: Collection,
  invitationId: string,
) {
  const submission = await collection.findOne({ invitationId })
  return submission && Submission.parse(submission)
}

async function addSubmission(collection: Collection, submission: Submission) {
  const submissionData = {
    ...submission,
  }
  const result = await collection.insertOne(submissionData)
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
  const invitationData = { ...invitation }
  const result = await collection.insertOne(invitationData)
  logger.info(`Invitation inserted to the database`, result)
  return invitation
}
