import React from 'react'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { PageContainer } from '@/common/components/PageContainer'
import { SubmissionsTable } from '@/app/submissions/components/SubmissionsTable'
import { Protected } from '@/common/components/auth/Protected'

export default function SubmissionsPage() {
  return (
    <Protected>
      <PageContainer>
        <PageHeading>
          <Text2xlBold>Submissions</Text2xlBold>
        </PageHeading>
        <SubmissionsTable />
      </PageContainer>
    </Protected>
  )
}
