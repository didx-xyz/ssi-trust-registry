'use client'
import { invite } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'

interface Inputs {
  emailAddress: string
}

const schema = z.object({ emailAddress: z.string().min(1, 'Required').email() })

export function InviteForm({ authToken }: { authToken?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(data: Inputs) {
    setIsLoading(true)
    try {
      await invite(data, authToken)
    } catch {}
    setIsLoading(false)
  }

  return (
    <div>
      <TextInput
        type="text"
        name="emailAddress"
        label="Email"
        placeholder="Enter email address of the company's representative"
        icon={<EmailIcon />}
        register={register}
        error={errors.emailAddress}
      />
      <div className="card-actions justify-center mt-8">
        <button
          className="btn btn-primary px-12 text-white normal-case"
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading && <span className="loading loading-spinner"></span>}
          Send invitation
        </button>
      </div>
    </div>
  )
}

function EmailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none w-6 h-6 absolute top-1/2 transform -translate-y-1/2 left-3"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 8.5L7.1404 11.2838C9.47738 13.0709 10.6459 13.9645 12 13.9645C13.3541 13.9645 14.5226 13.0709 16.8596 11.2838L20.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
