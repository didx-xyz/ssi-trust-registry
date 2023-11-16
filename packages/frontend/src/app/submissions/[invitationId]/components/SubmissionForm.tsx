'use client'
import { FieldError, submit } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'
import { Invitation } from '@/common/interfaces'
import { TextArea } from '@/common/components/TextArea'
import { Select } from '@/common/components/Select'

interface Inputs {
  name: string
  dids: string[]
  domain: string
  role: string
  credentials: string[]
  logo_url: string
}

const schema = z.object({
  name: z.string().min(1, 'Required'),
  dids: z.array(
    z
      .string()
      .min(1, 'Required')
      .refine(
        (e) =>
          /did:([a-z0-9]+):((?:[a-zA-Z0-9._%-]*:)*[a-zA-Z0-9._%-]+)$/.test(e),
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
        (e) =>
          /^did:([a-z0-9]+):((?:[a-zA-Z0-9._%-]*:)*[a-zA-Z0-9._%-]+)\/(?:[a-zA-Z0-9._%-]*)\/v[0-9]*\/SCHEMA\/(?:[a-zA-Z0-9._%-]*)\/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(
            e,
          ),
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
        <button
          className="btn btn-primary px-12 text-white normal-case"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting && <span className="loading loading-spinner"></span>}
          Submit
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center text-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="124"
        height="124"
        viewBox="0 0 124 124"
        fill="none"
      >
        <circle cx="62" cy="62" r="62" fill="#2BD18F" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M94.8218 44.165C96.3876 45.7234 96.3935 48.2561 94.835 49.8218L59.0032 85.8218C58.2528 86.5757 57.2331 86.9997 56.1694 87C55.1057 87.0003 54.0857 86.577 53.3348 85.8236L35.1667 67.5929C33.6073 66.0281 33.6117 63.4955 35.1764 61.936C36.7412 60.3766 39.2739 60.381 40.8333 61.9458L56.1664 77.3316L89.165 44.1782C90.7234 42.6125 93.2561 42.6065 94.8218 44.165Z"
          fill="white"
        />
      </svg>
      <div className="mt-8 ">
        <p className="text-2xl font-bold">Successfully submitted</p>
        <p className="text-sm pt-2">
          You will receive an email with approval or rejection within 24 hours.
        </p>
      </div>
    </div>
  )
}
