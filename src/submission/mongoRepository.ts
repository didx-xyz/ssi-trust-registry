import partial from 'lodash.partial'
import { Collection, Db } from 'mongodb'
import { createLogger } from '../logger'
import { Submission, SubmissionRepository } from './service'

const logger = createLogger(__filename)

export async function createSubmissionsRepository(
  database: Db,
): Promise<SubmissionRepository> {
  const collection = database.collection('submissions')
  return {
    getAllSubmissions: partial(getAllSubmissions, collection),
    findSubmissionByDid: partial(findSubmissionByDid, collection),
    addSubmission: partial(addSubmission, collection),
    deleteAll: partial(deleteAll, collection),
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

async function addSubmission(collection: Collection, submission: Submission) {
  const submissionData = {
    ...submission,
  }
  const result = await collection.insertOne(submissionData)
  logger.info(`Submission inserted to the database`, result)
  return submission
}

async function deleteAll(collection: Collection) {
  if ((await collection.countDocuments()) > 0) {
    return collection.drop()
  }
  return false
}
