import type { Submission } from './service'
import fs from 'node:fs/promises'

export async function getSubmissionByDid(did: string) {
  const submissions = await getAllSubmissions()
  return submissions.find((s: any) => s.did === did)
}

export async function saveSubmission(submission: Submission) {
  const submissions = await getAllSubmissions()
  submissions.push(submission)
  await fs.writeFile(
    './src/db/submissions.json',
    JSON.stringify(submissions, null, 2),
  )
}

export async function getAllSubmissions() {
  const submissionsContent = await fs.readFile('./src/db/submissions.json', {
    encoding: 'utf8',
  })
  return JSON.parse(submissionsContent)
}
