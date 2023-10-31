'use client'
import { useRouter } from 'next/navigation'
import { Path, UseFormRegister, useForm } from 'react-hook-form'
import { logIn } from '@/api'

interface Inputs {
  email: string
  password: string
}

export default function Login() {
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
              type="text"
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
              <button
                className="btn btn-primary"
                onClick={handleSubmit(onSubmit)}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

interface TextInputProps {
  type: string
  name: Path<Inputs>
  label: string
  placeholder: string
  register: UseFormRegister<Inputs>
}

function TextInput({
  type,
  name,
  label,
  placeholder,
  register,
}: TextInputProps) {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="input input-bordered w-full max-w-xs"
        {...register(name)}
      />
    </div>
  )
}
