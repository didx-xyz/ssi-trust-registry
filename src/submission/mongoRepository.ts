import { createLogger } from '../logger'
import type { Submission } from './service'
import { Db } from 'mongodb'

const logger = createLogger(__filename)

let _database: Db

export function initSubmissions(database: Db) {
  _database = database
}

export async function getSubmissionByDid(did: string) {
  const query = { did }
  const submissionsCollection = _database.collection('submissions')
  const submission = await submissionsCollection.findOne(query)
  return submission
}

export async function saveSubmission(submission: Submission) {
  const submissionsCollection = _database.collection('submissions')
  const submissionData = {
    ...submission,
  }
  const result = await submissionsCollection.insertOne(submissionData)
  logger.info(`Submission has been stored to database`, { metadata: result })
  return result
}

export function getAllSubmissions() {
  const submissionsCollection = _database.collection('submissions')
  return submissionsCollection.find().toArray()
}

export async function deleteAll() {
  const submissionsCollection = _database.collection('submissions')
  if ((await submissionsCollection.countDocuments()) > 0) {
    return submissionsCollection.drop()
  }
}
