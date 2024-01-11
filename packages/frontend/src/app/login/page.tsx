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

type AuthError = { general: string }

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<Inputs & AuthError>()

  async function onSubmit(data: Inputs) {
    try {
      console.log('data', data)
      await logIn(data)
      router.push('/')
    } catch (error) {
      console.error(error)
      setError('general', {
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
              {errors.general && (
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
              <Button
                onClick={(inputs) => {
                  clearErrors()
                  handleSubmit(onSubmit)(inputs)
                }}
                title="Log in"
                loading={isSubmitting}
              />
            </div>
          </div>
        </Card>
      </CardWrapper>
    </PageContainer>
  )
}
