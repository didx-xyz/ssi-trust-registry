import React from 'react'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { PageContainer } from '@/common/components/PageContainer'
import { TrustRegistryTable } from '@/app/components/TrustRegistryTable'

export default async function Home() {
  return (
    <PageContainer>
      <PageHeading>
        <Text2xlBold>Trusted Entities</Text2xlBold>
      </PageHeading>
      <TrustRegistryTable />
    </PageContainer>
  )
}
