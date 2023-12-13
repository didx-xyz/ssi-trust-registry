'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Submission, SubmissionWithEmail } from '@/common/interfaces'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/common/components/Table'
import Image from 'next/image'
import dayjs from 'dayjs'
import { TextSmBold } from '@/common/components/Typography'
import { backendUrl, betterFetch, getInvitation } from '@/api'
import { PlusIcon } from '@/common/components/images/PlusIcon'

export function SubmissionsTable() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SubmissionWithEmail[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  useEffect(() => {
    getSubmissionsWithEmails()
      .then((submissions) => {
        setSubmissions(submissions)
      })
      .catch(() => {
        setSubmissions([])
      })
  }, [])

  return (
    <>
      <Filter
        options={['pending', 'rejected', 'approved']}
        selectedOptions={selectedFilters}
        onChange={setSelectedFilters}
      />

      <Table>
        <TableHeader>
          <th className="w-5/12">Company name</th>
          <th className="w-1/12 text-right">State</th>
          <th className="w-2/12 text-right">Updated</th>
          <th className="w-2/12 text-right">Submitted</th>
          <th className="w-2/12 text-right">Email</th>
        </TableHeader>
        <TableBody>
          {submissions
            .filter((submission: SubmissionWithEmail) => {
              return (
                !selectedFilters.length ||
                selectedFilters.includes(submission.state)
              )
            })
            .map((submission: SubmissionWithEmail) => {
              return (
                <TableRow
                  key={submission.id}
                  onClick={() => router.push(`/submissions/${submission.id}`)}
                >
                  <TableCell className="rounded-l-lg border-l-2">
                    <Image
                      className="mr-2"
                      src={submission.logo_url}
                      alt={submission.name}
                      width={24}
                      height={24}
                    />
                    <p>{submission.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-right w-full capitalize">
                      {submission.state}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-right w-full">
                      {dayjs(submission.updatedAt).format('DD/MM/YYYY')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-right w-full">
                      {dayjs(submission.createdAt).format('DD/MM/YYYY')}
                    </p>
                  </TableCell>
                  <TableCell className="rounded-r-lg border-r-2">
                    <p className="text-right w-full">
                      {submission.emailAddress}
                    </p>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </>
  )
}

async function getSubmissionsWithEmails(): Promise<SubmissionWithEmail[]> {
  const submissions = await betterFetch('GET', `${backendUrl}/api/submissions`)
  const submissionsWithEmails = await Promise.all(
    submissions.map(async (submission: Submission) => {
      const invitation = await getInvitation({
        invitationId: submission.invitationId,
      })
      return { ...submission, emailAddress: invitation.emailAddress }
    }),
  )
  return submissionsWithEmails
}

interface FilterProps {
  options: string[]
  selectedOptions: string[]
  onChange: (value: string[]) => void
}

interface FilterButtonProps {
  onClick: any
  isActive: boolean
  value: string
}

function Filter({ options, selectedOptions, onChange }: FilterProps) {
  function toggleFilterValue(option: string): void {
    if (selectedOptions.includes(option)) {
      const optionIndex = selectedOptions.indexOf(option)

      selectedOptions.splice(optionIndex, 1)
      onChange([...selectedOptions])
    } else {
      onChange([...selectedOptions, option])
    }
  }

  function isActive(filter: string): boolean {
    return selectedOptions.includes(filter)
  }

  return (
    <div className="flex flex-col">
      <div className="pl-4 h-6 mb-1.5 mt-0.5">
        <TextSmBold>Filters</TextSmBold>
      </div>
      <div className="flex gap-x-2 mb-6">
        {options.map((option) => {
          return (
            <FilterButton
              key={option}
              isActive={isActive(option)}
              onClick={() => toggleFilterValue(option)}
              value={option}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterButton({ onClick, isActive, value }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        'btn rounded-full min-h-0 h-10 text-sm normal-case transition ' +
        (isActive
          ? 'bg-primary hover:bg-primary text-white'
          : 'bg-white hover:bg-white text-primary')
      }
    >
      <PlusIcon
        className={
          'transition duration-500 ' +
          (isActive ? 'rotate-45 text-white' : 'text-primary')
        }
      />
      <p className="capitalize">{value}</p>
    </button>
  )
}
