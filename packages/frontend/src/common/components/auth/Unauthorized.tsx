'use client'
import React from 'react'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import { Button } from '@/common/components/Button'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/common/components/PageContainer'
import { Card } from '@/common/components/Card'
import { BreadcrumbsContainer } from '@/common/components/navigation/BreadcrumbsContainer'
import { AlignCardCenter } from '@/common/components/AlignCardCenter'

export function Unauthorized() {
  const router = useRouter()

  return (
    <PageContainer>
      <BreadcrumbsContainer />
      <AlignCardCenter>
        <Card>
          <div className="flex flex-col items-center gap-y-8">
            <div className="flex flex-col items-center gap-y-2">
              <Text2xlBold>Unauthorized</Text2xlBold>
              <TextSm>You need to be authorized to access this page</TextSm>
            </div>
            <Button
              title="Login as Admin"
              onClick={() => {
                router.push('/login')
              }}
            />
          </div>
        </Card>
      </AlignCardCenter>
    </PageContainer>
  )
}
