import partial from 'lodash.partial'
import { ClientSession, Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Invitation, Submission } from './domain'
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
    findSubmissionById: partial(findSubmissionById, submissionCollection),
    addSubmission: partial(addSubmission, submissionCollection),
    updateSubmission: partial(updateSubmission, submissionCollection),
  }
}

export async function createInvitationRepository(
  database: Db,
): Promise<InvitationRepository> {
  const invitationCollection = database.collection('invitations')
  return {
    addInvitation: partial(addInvitation, invitationCollection),
    updateInvitation: partial(updateInvitation, invitationCollection),
    deleteInvitation: partial(deleteInvitation, invitationCollection),
    getAllInvitations: partial(getAllInvitations, invitationCollection),
    findInvitationById: partial(findInvitationById, invitationCollection),
  }
}

async function getAllSubmissions(collection: Collection) {
  const result = await collection.find().sort({ createdAt: -1 }).toArray()
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

async function findSubmissionById(collection: Collection, id: string) {
  const submission = await collection.findOne({ id })
  return submission && Submission.parse(submission)
}

async function addSubmission(collection: Collection, submission: Submission) {
  const result = await collection.replaceOne(
    { invitationId: submission.invitationId, state: 'pending' },
    { ...submission },
    { upsert: true },
  )
  logger.info(`Submission inserted to the database`, result)
  return submission
}

async function updateSubmission(
  collection: Collection,
  submission: Submission,
  config: { session?: ClientSession; newDatestamps?: boolean } = {
    newDatestamps: true,
  },
) {
  const { id, ...data } = submission
  if (config.newDatestamps) {
    data.updatedAt = new Date().toISOString()
  }
  const updatedSubmission = await collection.findOneAndUpdate(
    { id },
    { $set: { ...data } },
    { returnDocument: 'after', session: config.session },
  )
  if (!updatedSubmission) {
    throw new Error(`Submission with id ${id} not found`)
  }
  return Submission.parse(updatedSubmission)
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
  config?: { session?: ClientSession },
) {
  const { id, ...data } = invitation
  const updatedInvitation = await collection.findOneAndUpdate(
    { id },
    { $set: { ...data } },
    { ...config, returnDocument: 'after' },
  )
  if (!updatedInvitation) {
    throw new Error(`Invitation with id ${id} not found`)
  }
  return Invitation.parse(updatedInvitation)
}

async function deleteInvitation(collection: Collection, id: string) {
  const result = await collection.deleteOne({ id })
  logger.info(`Invitation deleted from the database`, result)
}
