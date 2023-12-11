'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { getUser, logIn } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'
import { PageContainer } from '@/common/components/PageContainer'
import { Text2xlBold } from '@/common/components/Typography'
import React, { useEffect } from 'react'
import { Card } from '@/common/components/Card'
import { BreadcrumbsContainer } from '@/common/components/navigation/BreadcrumbsContainer'
import { AlignCardCenter } from '@/common/components/AlignCardCenter'

interface Inputs {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<Inputs>()

  function onSubmit(data: Inputs) {
    console.log('formState.errors', formState.errors)
    console.log('data', data)
    logIn(data)
      .then(() => {
        router.push('/')
      })
      .catch(console.error)
  }

  useEffect(() => {
    getUser().then((user) => {
      if (user.id) {
        router.push('/')
      }
    })
  }, [router])

  return (
    <PageContainer>
      <BreadcrumbsContainer />
      <AlignCardCenter>
        <Card>
          <div className="flex flex-col items-center gap-y-8">
            <Text2xlBold>Admin Login</Text2xlBold>
            <div className="flex flex-col w-full gap-y-4">
              <TextInput
                type="email"
                name="email"
                label="E-mail address"
                placeholder="Enter e-mail address"
                register={register}
              />
              <TextInput
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                register={register}
              />
            </div>
            <div className="card-actions justify-center w-full">
              <Button onClick={handleSubmit(onSubmit)} title="Log in" />
            </div>
          </div>
        </Card>
      </AlignCardCenter>
    </PageContainer>
  )
}
