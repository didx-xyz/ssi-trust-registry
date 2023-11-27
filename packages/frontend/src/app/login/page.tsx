'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { logIn } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'

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

  return (
    <main className="container mx-auto">
      <div className="flex justify-center">
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center">
            <h1 className="text-3xl font-bold">Admin Login</h1>
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
            <div className="card-actions justify-center">
              <Button onClick={handleSubmit(onSubmit)} title="Log in" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
