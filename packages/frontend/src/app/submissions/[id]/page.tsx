import { PageContent } from '@/app/submissions/[id]/components/PageContent'
import { Protected } from '@/common/components/auth/Protected'
import React from 'react'

export default function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Protected>
      <PageContent id={params.id} />
    </Protected>
  )
}
