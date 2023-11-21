'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { invite } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import Success from '@/common/assets/Success.svg'
import EmailIcon from '../assets/EmailIcon.svg'

interface Inputs {
  emailAddress: string
}

const schema = z.object({ emailAddress: z.string().min(1, 'Required').email() })

export function InviteForm({ authToken }: { authToken?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    getValues,
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })
  async function onSubmit(data: Inputs) {
    await invite(data, authToken)
  }

  return !isSubmitSuccessful ? (
    <div>
      <p className="text-2xl font-bold leading-normal pb-2">Invite a company</p>
      <p className="text-sm leading-normal">
        Enter email address of the company&apos;s representative,
        <br />
        that you want to invite.
      </p>
      <TextInput
        type="email"
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
          {isSubmitting && <span className="loading loading-spinner"></span>}
          Send invitation
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center text-primary">
      <Success />
      <div className="py-8">
        <p className="text-2xl font-bold">Invitation sent</p>
        <p className="text-sm pt-2">
          Invitation was successfully sent to {getValues('emailAddress')}
        </p>
      </div>
      <div className="flex gap-4">
        <button className="btn bg-medium  normal-case" onClick={() => reset()}>
          {isSubmitting && <span className="loading loading-spinner"></span>}
          Send another invitation
        </button>
        <Link
          href="/"
          className="btn bg-accent h-12 min-w-[192px] text-white normal-case hover:bg-accentHover"
        >
          Back to Trusted Entities
        </Link>
      </div>
    </div>
  )
}
