'use client'

import { betterFetch } from '@/api'
import { Button } from '@/common/components/Button'

export function RejectButton({
  submissionId,
  authToken,
}: {
  submissionId: string
  authToken?: string
}) {
  return (
    <Button
      type="secondary"
      onClick={() => rejectSubmission(submissionId, authToken)}
      title="Reject"
    />
  )
}

function rejectSubmission(submissionId: string, token?: string) {
  return betterFetch(
    'PUT',
    `http://localhost:3000/api/submissions/${submissionId}`,
    { Cookie: `token=${token}` },
    { state: 'rejected' },
  )
}
