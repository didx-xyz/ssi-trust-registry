'use client'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { FormTextInput } from '@/common/components/FormTextInput'
import { Button } from '@/common/components/Button'
import Success from '@/common/assets/Success.svg'
import { backendUrl, betterFetch } from '@/api'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import EmailIcon from '../assets/EmailIcon.svg'
import { GenericErrorContents } from '@/common/components/GenericErrorContents'
import { GenericError } from '@/common/interfaces'

interface Inputs {
  emailAddress: string
}

const schema = z.object({ emailAddress: z.string().min(1, 'Required').email() })

export function InviteForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    getValues,
    reset,
    setError,
  } = useForm<Inputs & GenericError>({
    resolver: zodResolver(schema),
  })
  async function onSubmit(data: Inputs) {
    try {
      await invite(data)
    } catch (e) {
      setError('generic', { type: 'manual', message: 'Something went wrong' })
    }
  }

  return errors.generic ? (
    <GenericErrorContents />
  ) : isSubmitSuccessful ? (
    <SuccessContents
      emailAddress={getValues().emailAddress}
      onClick={() => reset}
    />
  ) : (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <Text2xlBold>Invite a company</Text2xlBold>
        <TextSm>
          Enter email address of the company&apos;s representative, that you
          want to invite.
        </TextSm>
      </div>
      <FormTextInput
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
  )
}

function SuccessContents({
  emailAddress,
  onClick,
}: {
  emailAddress: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-col gap-8 justify-center items-center text-primary">
      <Success />
      <div className="flex flex-col gap-2 text-center">
        <Text2xlBold>Invitation sent</Text2xlBold>
        <TextSm>Invitation was successfully sent to {emailAddress}</TextSm>
      </div>
      <div className="flex gap-4">
        <Button
          type="secondary"
          title="Send another invitation"
          onClick={onClick}
        />
        <Button href="/invitations" title="Back to Invitations" />
      </div>
    </div>
  )
}

async function invite({ emailAddress }: { emailAddress: string }) {
  return betterFetch(
    'POST',
    `${backendUrl}/api/invitations`,
    {},
    { emailAddress },
  )
}
