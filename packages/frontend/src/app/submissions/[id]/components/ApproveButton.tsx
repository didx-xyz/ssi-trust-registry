'use client'
import { betterFetch } from '@/api'
import { Button } from '@/common/components/Button'

export function ApproveButton({
  submissionId,
  authToken,
}: {
  submissionId: string
  authToken?: string
}) {
  return (
    <Button
      onClick={() => approveSubmission(submissionId, authToken)}
      title="Approve"
    />
  )
}

function approveSubmission(submissionId: string, token?: string) {
  return betterFetch(
    'PUT',
    `http://localhost:3000/api/submissions/${submissionId}`,
    { Cookie: `token=${token}` },
    { state: 'approved' },
  )
}
