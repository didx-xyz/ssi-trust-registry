'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'
import Success from '@/common/assets/Success.svg'
import EmailIcon from '../assets/EmailIcon.svg'
import { betterFetch } from '@/api'

interface Inputs {
  emailAddress: string
}

const schema = z.object({ emailAddress: z.string().min(1, 'Required').email() })

type ServerError = { server?: never }

export function InviteForm({ authToken }: { authToken?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    getValues,
    reset,
    setError,
  } = useForm<Inputs & ServerError>({
    resolver: zodResolver(schema),
  })
  async function onSubmit(data: Inputs) {
    try {
      await invite(data, authToken)
    } catch (e) {
      setError('server', { type: 'manual', message: 'Something went wrong' })
    }
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
        <Button
          title="Send Invitation"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
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
        <Button
          type="secondary"
          title="Send another invitation"
          onClick={() => reset()}
        />
        <Button href="/" title="Back to Trusted Entities" />
      </div>
    </div>
  )
}

async function invite(
  { emailAddress }: { emailAddress: string },
  token?: string,
) {
  return betterFetch(
    'POST',
    'http://localhost:3000/api/invitation',
    { Cookie: `token=${token}` },
    { emailAddress },
  )
}
