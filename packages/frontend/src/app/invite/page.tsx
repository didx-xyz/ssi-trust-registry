'use client'

import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { stat } from 'fs'
import React, { useState, FormEvent } from 'react'

const status = {
  Initial: 'Initial',
  Loading: 'Loading',
  Error: 'Error',
  Success: 'Success',
}
export default function Invite() {
  const [emailAddress, setEmailAddress] = useState('')
  const [formStatus, setFormStatus] = useState(status.Initial)
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit() {
    try {
      setFormStatus(status.Loading)
      setErrorMessage('')
      if (!emailAddress) throw new Error('Email address is required')
      const response = await fetch('http://localhost:3001/api/invitation', {
        body: JSON.stringify({ emailAddress }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.status === 400) {
        throw new Error('Invalid email address')
      }
      setFormStatus(status.Success)
    } catch (error: any) {
      console.error(error)
      if (
        error.message === 'Email address is required' ||
        error.message === 'Invalid email address'
      ) {
        setErrorMessage(error.message)
      }
      setFormStatus(status.Error)
    }
  }

  return (
    <main
      style={{ color: '#2D3E47' }}
      className="flex min-h-screen flex-col w-full items-center"
    >
      <NavigationBreadcrumbs rootHref="/" rootName="Trusted Entities" />

      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-fit max-w-4xl">
        <div>
          <p className="text-2xl font-bold leading-normal pb-2">
            Invite a company
          </p>
          <p className="text-sm leading-normal">
            Enter email address of company&apos;s representative,
            <br />
            that you want to invite.
          </p>
        </div>
        <div className="form-control w-full text-sm py-8">
          <label className="label p-0 pl-4 ">
            <span className="label-text">Email</span>
          </label>
          <label className="relative text-gray-400 focus-within:text-gray-600 block">
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
            <input
              onChange={(event) => {
                setFormStatus(status.Initial)
                setEmailAddress(event.target.value)
              }}
              type="text"
              placeholder="Enter email address of company's representative"
              className={`input input-md bg-zinc-100 w-full pl-12 ${
                formStatus === status.Error && 'input-error'
              }`}
            />
          </label>
          <p className="text-sm text-error self-start text-left">
            {errorMessage}
          </p>
        </div>
        <button
          onClick={onSubmit}
          className="btn btn-primary mx-40 px-12 text-white normal-case"
        >
          {formStatus === status.Loading && (
            <span className="loading loading-spinner"></span>
          )}
          Send invitation
        </button>
      </div>
    </main>
  )
}
