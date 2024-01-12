'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { getUser, logIn } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'
import { PageContainer } from '@/common/components/PageContainer'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import React, { useEffect } from 'react'
import { Card, CardWrapper } from '@/common/components/Card'
import { NavigationBreadcrumbsPlaceholder } from '@/common/components/navigation/Breadcrumbs'

interface Inputs {
  email: string
  password: string
}

type AuthError = { server: string }

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<Inputs & AuthError>()

  async function onSubmit(inputs: Inputs) {
    try {
      console.log('inputs', inputs)
      await logIn(inputs)
      router.push('/')
    } catch (error) {
      console.error(error)
      setError('server', {
        type: 'manual',
        message: 'Authorization failed.',
      })
    }
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
      <NavigationBreadcrumbsPlaceholder />
      <CardWrapper>
        <Card>
          <div className="flex flex-col items-center gap-y-8">
            <div className="flex flex-col items-center gap-y-2">
              <Text2xlBold>Admin Login</Text2xlBold>
              {errors.server && (
                <TextSm className="text-error">
                  Your email or your password is incorrect. Please, try again.
                </TextSm>
              )}
            </div>
            <div className="flex flex-col w-full gap-y-4">
              <TextInput
                type="email"
                name="email"
                label="E-mail address"
                placeholder="Enter e-mail address"
                register={register}
                onChange={clearErrors}
              />
              <TextInput
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                register={register}
                onChange={clearErrors}
              />
            </div>
            <div className="card-actions justify-center w-full">
              <Button
                onClick={handleSubmit(onSubmit)}
                title="Log in"
                loading={isSubmitting}
                disabled={!!errors.server}
              />
            </div>
          </div>
        </Card>
      </CardWrapper>
    </PageContainer>
  )
}
