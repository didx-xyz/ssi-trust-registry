'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FieldError, submit } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import { Invitation } from '@/common/interfaces'
import { TextArea } from '@/common/components/TextArea'
import { Select } from '@/common/components/Select'
import Success from '@/common/assets/Success.svg'
import { Button } from '@/common/components/Button'

interface Inputs {
  name: string
  dids: string[]
  domain: string
  role: string
  credentials: string[]
  logo_url: string
}

const didRegex = /^did:([a-z0-9]+):((?:[a-zA-Z0-9._%-]*:)*[a-zA-Z0-9._%-]+)$/
const schemaIdRegex =
  /^did:([a-z0-9]+):((?:[a-zA-Z0-9._%-]*:)*[a-zA-Z0-9._%-]+)\/(?:[a-zA-Z0-9._%-]*)\/v[0-9]*\/SCHEMA\/(?:[a-zA-Z0-9._%-]*)\/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

const schema = z.object({
  name: z.string().min(1, 'Required'),
  dids: z.array(
    z
      .string()
      .min(1, 'Required')
      .refine(
        (e) => didRegex.test(e),
        (e) => ({ message: `'${e}' is not a valid fully qualified DID` }),
      ),
  ),
  domain: z.string().min(1, 'Required').url('Not a valid URL'),
  role: z.string().min(1, 'Required'),
  credentials: z.array(
    z
      .string()
      .min(1, 'Required')
      .refine(
        (e) => schemaIdRegex.test(e),
        (e) => ({ message: `'${e}' is not a valid fully schema ID` }),
      ),
  ),
  logo_url: z.string().min(1, 'Required').url('Not a valid URL'),
})

export function SubmissionForm({ invitation }: { invitation: Invitation }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })
  async function onSubmit(data: Inputs) {
    try {
      await submit({ ...data, role: [data.role] }, invitation.id)
    } catch (error: any) {
      if (error instanceof FieldError) {
        setError(error.field as keyof Inputs, {
          type: 'manual',
          message: error.message,
        })
      }
    }
  }

  return !isSubmitSuccessful ? (
    <div>
      <p className="text-2xl font-bold pb-2">Submission Form</p>
      <p className="text-sm mb-8">
        You are submitting this form as {invitation.emailAddress}{' '}
      </p>
      <div className="flex flex-col gap-4">
        <TextInput
          type="text"
          name="name"
          label="Entity Name"
          placeholder="Name"
          register={register}
          error={errors.name}
        />
        <TextArea
          label="DIDs (split by newline)"
          placeholder="DIDs"
          control={control}
          name="dids"
          errors={errors.dids}
        />
        <TextInput
          type="text"
          name="domain"
          label="Domain"
          placeholder="Domain"
          register={register}
          error={errors.domain}
        />
        <Select
          options={[
            { label: 'Issuer', value: 'issuer' },
            { label: 'Verifier', value: 'verifier' },
          ]}
          name="role"
          label="Role"
          placeholder="Role"
          register={register}
          error={errors.role}
        />
        <TextArea
          label="Schema IDs (split by newline)"
          placeholder="Schema IDs"
          control={control}
          name="credentials"
          errors={errors.credentials}
        />
        <TextInput
          type="text"
          name="logo_url"
          label="Logo URL (SVG Format)"
          placeholder="Logo URL"
          register={register}
          error={errors.logo_url}
        />
      </div>
      <div className="card-actions justify-center mt-8">
        <Button
          title="Submit"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center text-primary">
      <Success />
      <div className="mt-8 ">
        <p className="text-2xl font-bold">Successfully submitted</p>
        <p className="text-sm pt-2">
          You will receive an email with approval or rejection within 24 hours.
        </p>
      </div>
    </div>
  )
}
