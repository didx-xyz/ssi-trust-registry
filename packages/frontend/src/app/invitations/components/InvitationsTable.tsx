'use client'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/common/components/Table'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Submission, Invitation } from '@ssi-trust-registry/common'
import { backendUrl, betterFetch } from '@/api'

export function InvitationsTable() {
  const [invitations, setInvitations] = useState<
    (Invitation & { latestSubmission?: Submission })[]
  >([])

  useEffect(() => {
    getInvitationsWithLatestSubmission()
      .then((invitations) => {
        setInvitations(invitations)
      })
      .catch(() => {
        setInvitations([])
      })
  }, [])

  return (
    <Table>
      <TableHeader>
        <th className="w-5/12">Email Address</th>
        <th className="w-2/12 text-right">Invitation Link</th>
        <th className="w-2/12 text-right">Latest Submission</th>
        <th className="w-1/12 text-right">Entity</th>
        <th className="w-1/12 text-right">Created</th>
        <th className="w-1/12 text-right">Actions</th>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation, rowIndex) => {
          return (
            <TableRow key={rowIndex}>
              <TableCell className="rounded-l-lg">
                <p>{invitation.emailAddress}</p>
              </TableCell>
              <TableCell>
                <p className="text-right capitalize w-full">{invitation.id}</p>
              </TableCell>
              <TableCell>
                <p className="text-right w-full">
                  {invitation.latestSubmission ? (
                    <Link
                      href={`/submissions/${invitation.latestSubmission.id}`}
                      className="text-primary hover:opacity-70 underline"
                    >
                      {dayjs(invitation.latestSubmission.createdAt).format(
                        'DD/MM/YYYY',
                      )}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-right w-full">
                  {invitation.entityId ? (
                    <Link
                      href={`/entities/${invitation.entityId}`}
                      className="text-primary hover:opacity-70 underline"
                    >
                      {invitation.entityId}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-right w-full">
                  {dayjs(invitation.createdAt).format('DD/MM/YYYY')}
                </p>
              </TableCell>
              <TableCell className="rounded-r-lg">
                <p className="text-right w-full">
                  <span
                    className="cursor-pointer"
                    onClick={() => resendInvitation(invitation.id)}
                  >
                    Resend
                  </span>
                </p>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

async function getInvitationsWithLatestSubmission(): Promise<
  (Invitation & { latestSubmission?: Submission })[]
> {
  const invitations = await betterFetch('GET', `${backendUrl}/api/invitations`)
  return await Promise.all(
    invitations.map(async (invitation: Invitation) => {
      const submissions: Submission[] = await betterFetch(
        'GET',
        `${backendUrl}/api/invitations/${invitation.id}/submissions`,
      )
      if (submissions.length) {
        return { ...invitation, latestSubmission: submissions[0] }
      }
      return { ...invitation }
    }),
  )
}

async function resendInvitation(id: any) {
  try {
    const response = await betterFetch(
      'POST',
      `${backendUrl}/api/invitations/${id}/resend`,
    )

    return response
  } catch (error) {
    return []
  }
}
