'use client'
import { invite } from '@/api'
import { TextInput } from '@/common/components/TextInput'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'
import Link from 'next/link'

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
          {isSubmitting && <span className="loading loading-spinner"></span>}
          Send invitation
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
      <div className="py-8 ">
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
