'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { getUser, logIn } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'
import { PageContainer } from '@/common/components/PageContainer'
import { Text2xlBold } from '@/common/components/Typography'
import React, { useEffect } from 'react'

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
    async function getUserData() {
      const userData = await getUser()
      if (userData.id) {
        router.push('/')
      }
    }

    getUserData()
  }, [router])

  return (
    <PageContainer>
      <div className="flex justify-center mt-14">
        <div className="card card-compact bg-white shadow-xl p-16 w-full max-w-[585px]">
          <div className="card-body items-center !p-0 gap-y-8">
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
        </div>
      </div>
    </PageContainer>
  )
}
