import { SubmissionDetailContent } from '@/app/submissions/[id]/components/SubmissionDetailContent'
import { Protected } from '@/common/components/auth/Protected'
import React from 'react'
import { PageContainer } from '@/common/components/PageContainer'

export default function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Protected>
      <PageContainer>
        <SubmissionDetailContent id={params.id} />
      </PageContainer>
    </Protected>
  )
}
