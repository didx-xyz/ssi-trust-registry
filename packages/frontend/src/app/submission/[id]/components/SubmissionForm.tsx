'use client'
import { invite } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import React, { useState } from 'react'
import { Controller, Merge, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'
import { Invitation } from '@/common/interfaces'
import { TextArea } from '@/common/components/TextArea'

interface Inputs {
  entityName: string
  dids: string[]
  domain: string
  role: string
  schemaIds: string[]
  logoUrl: string
}

const schema = z.object({
  entityName: z.string().min(1, 'Required'),
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
  schemaIds: z.array(
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
  logoUrl: z.string().min(1, 'Required').url('Not a valid URL'),
})

export function SubmissionForm({ invitation }: { invitation: Invitation }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })
  async function onSubmit(data: Inputs) {
    await invite(data, authToken)
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
          name="entityName"
          label="Entity Name"
          placeholder="Name"
          register={register}
          error={errors.entityName}
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
        <TextInput
          type="text"
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
          name="schemaIds"
          errors={errors.schemaIds}
        />
        <TextInput
          type="text"
          name="logoUrl"
          label="Logo URL (SVG Format)"
          placeholder="Logo URL"
          register={register}
          error={errors.logoUrl}
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
    </div>
  )
}
