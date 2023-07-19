import type { Submission } from './service'
import { Db } from 'mongodb'

let _database: Db

export function init(database: Db) {
  _database = database
}

export async function getSubmissionByDid(did: string) {
  const query = { did }
  const submissionsCollection = _database.collection('submissions')
  const submission = await submissionsCollection.findOne(query)
  return submission
}

export async function saveSubmission(submission: Submission) {
  throw new Error('Not implemented yet')
}

export async function getAllSubmissions() {
  throw new Error('Not implemented yet')
}
