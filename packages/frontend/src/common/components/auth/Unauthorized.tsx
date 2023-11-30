'use client'
import React from 'react'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import { Button } from '@/common/components/Button'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/common/components/PageContainer'

export function Unauthorized() {
  const router = useRouter()

  return (
    <PageContainer>
      <div className="flex justify-center mt-14">
        <div className="card card-compact bg-white shadow-xl p-16 w-full max-w-[585px]">
          <div className="card-body items-center !p-0 gap-y-8">
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
        </div>
      </div>
    </PageContainer>
  )
}
