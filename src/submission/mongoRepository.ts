import { createLogger } from '../logger'
import type { Submission } from './service'
import { Collection, Db } from 'mongodb'

const logger = createLogger(__filename)

let _database: Db
let _collection: Collection

export function initSubmissions(database: Db) {
  _database = database
  _collection = _database.collection('submissions')
}

export async function getSubmissionByDid(did: string) {
  const query = { did }

  const submission = await _collection.findOne(query)
  return submission
}

export async function saveSubmission(submission: Submission) {
  const submissionData = {
    ...submission,
  }
  const result = await _collection.insertOne(submissionData)
  logger.info(`Submission has been stored to the database`, result)
  return result
}

export function getAllSubmissions() {
  return _collection.find().toArray()
}

export async function deleteAll() {
  if ((await _collection.countDocuments()) > 0) {
    return _collection.drop()
  }
}
