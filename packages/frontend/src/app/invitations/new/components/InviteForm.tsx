'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInput } from '@/common/components/TextInput'
import { Button } from '@/common/components/Button'
import Success from '@/common/assets/Success.svg'
import EmailIcon from '../assets/EmailIcon.svg'
import { backendUrl, betterFetch } from '@/api'
import { Text2xlBold, TextSm } from '@/common/components/Typography'

interface Inputs {
  emailAddress: string
}

const schema = z.object({ emailAddress: z.string().min(1, 'Required').email() })

type ServerError = { server?: never }

export function InviteForm() {
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
      await invite(data)
    } catch (e) {
      setError('server', { type: 'manual', message: 'Something went wrong' })
    }
  }

  return !isSubmitSuccessful ? (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Text2xlBold>Invite a company</Text2xlBold>
        <TextSm>
          Enter email address of the company&apos;s representative, that you
          want to invite.
        </TextSm>
      </div>
      <TextInput
        type="email"
        name="emailAddress"
        label="Email"
        placeholder="Enter email address of the company's representative"
        icon={<EmailIcon />}
        register={register}
        error={errors.emailAddress}
      />
      <div className="card-actions justify-center">
        <Button
          title="Send Invitation"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-8 justify-center items-center text-primary">
      <Success />
      <div className="flex flex-col gap-2">
        <Text2xlBold>Invitation sent</Text2xlBold>
        <TextSm>
          Invitation was successfully sent to {getValues('emailAddress')}
        </TextSm>
      </div>
      <div className="flex gap-4">
        <Button
          type="secondary"
          title="Send another invitation"
          onClick={() => reset()}
        />
        <Button href="/invitations" title="Back to Invitations" />
      </div>
    </div>
  )
}

async function invite({ emailAddress }: { emailAddress: string }) {
  return betterFetch(
    'POST',
    'http://localhost:3000/api/invitations',
    {},
    { emailAddress },
  )
}
