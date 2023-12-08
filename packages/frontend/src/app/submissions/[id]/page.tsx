import { SubmissionDetailContent } from '@/app/submissions/[id]/components/SubmissionDetailContent'
import { Protected } from '@/common/components/auth/Protected'
import React from 'react'

export default function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Protected>
      <SubmissionDetailContent id={params.id} />
    </Protected>
  )
}
