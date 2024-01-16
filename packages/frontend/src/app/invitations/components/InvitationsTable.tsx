import React from 'react'
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
import { getAuthToken } from '@/common/helpers'
import { ResendInvitation } from '@/app/invitations/components/ResendInvitation'

export async function InvitationsTable() {
  const token = getAuthToken()
  const invitations = await getInvitationsWithLatestSubmission(token)

  return (
    <Table>
      <TableHeader>
        <th className="w-4/12">Email Address</th>
        <th className="w-2/12 text-right">Invitation Link</th>
        <th className="w-2/12 text-right">Latest Submission</th>
        <th className="w-1/12 text-right">Entity</th>
        <th className="w-1/12 text-right">Created</th>
        <th className="w-2/12 text-right">Actions</th>
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
                <div className="text-right w-full">
                  <ResendInvitation invitationId={invitation.id} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

async function getInvitationsWithLatestSubmission(
  token?: string,
): Promise<(Invitation & { latestSubmission?: Submission })[]> {
  if (!token) {
    return []
  }
  const invitations = await betterFetch(
    'GET',
    `${backendUrl}/api/invitations`,
    { Cookie: `token=${token}` },
  )
  const getInvitationsWithLatestSubmission = await Promise.all(
    invitations.map(async (invitation: Invitation) => {
      const submissions: Submission[] = await betterFetch(
        'GET',
        `${backendUrl}/api/invitations/${invitation.id}/submissions`,
        { Cookie: `token=${token}` },
      )
      if (submissions.length) {
        return { ...invitation, latestSubmission: submissions[0] }
      }
      return { ...invitation }
    }),
  )
  return getInvitationsWithLatestSubmission
}
