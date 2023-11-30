import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { Invitation, Submission } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@/common/components/Table'
import { getAuthToken } from '@/common/helpers'
import { backendUrl, betterFetch } from '@/api'
import Link from 'next/link'
import { Button } from '@/common/components/Button'
import { Protected } from '@/common/components/auth/Protected'

export default async function InvitationsPage() {
  const token = getAuthToken()
  const invitations = await getInvitationsWithLatestSubmission(token)
  return (
    <Protected>
      <PageContainer>
        <PageHeading>
          <Text2xlBold>Invitations</Text2xlBold>
          <Button href="/invitations/new" title="Invite a company" />
        </PageHeading>

        <Table>
          <TableHeader>
            <th className="p-4 w-5/12">Email Address</th>
            <th className="p-4 w-2/12 text-right">Invitation Link</th>
            <th className="p-4 w-2/12 text-right">Latest Submission</th>
            <th className="p-4 w-2/12 text-right">Entity</th>
            <th className="p-4 w-1/12 text-right">Invitation Sent</th>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  <TableCell className="rounded-l-lg">
                    <p>{invitation.emailAddress}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-right capitalize w-full">
                      {invitation.id}
                    </p>
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
                  <TableCell className="rounded-r-lg">
                    <p className="text-right w-full">
                      {dayjs(invitation.createdAt).format('DD/MM/YYYY')}
                    </p>
                  </TableCell>
                </tr>
              )
            })}
          </TableBody>
        </Table>
      </PageContainer>
    </Protected>
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
