import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold, TextSmBold } from '@/common/components/Typography'
import { Invitation, Submission } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { Table, TableBody, TableHeader } from '@/common/components/Table'
import { getAuthToken } from '@/common/helpers'
import { betterFetch } from '@/api'
import Link from 'next/link'

export default async function InvitationsPage() {
  const token = getAuthToken()
  const invitations = await getInvitationsWithLatestSubmission(token)
  return (
    <PageContainer>
      <PageHeading>
        <Text2xlBold>Invitations</Text2xlBold>
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
                <td className="p-0 table-fixed break-all">
                  <div className="flex p-4 bg-white mb-1 items-center rounded-l-lg">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden">
                      {invitation.emailAddress}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right capitalize">
                      {invitation.id}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1 ">
                    <div className="leading-6 min-h-6 h-6 overflow-hidden text-right">
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
                        <p>N/A</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1 rounded-r-lg">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                      {invitation.entityId ? (
                        <Link
                          href={`/entities/${invitation.entityId}`}
                          className="text-primary hover:opacity-70 underline"
                        >
                          {invitation.entityId}
                        </Link>
                      ) : (
                        <p>N/A</p>
                      )}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1 ">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                      {dayjs(invitation.createdAt).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </td>
              </tr>
            )
          })}
        </TableBody>
      </Table>
    </PageContainer>
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
    'http://localhost:3000/api/invitations',
    { Cookie: `token=${token}` },
  )
  const getInvitationsWithLatestSubmission = await Promise.all(
    invitations.map(async (invitation: Invitation) => {
      const submissions: Submission[] = await betterFetch(
        'GET',
        `http://localhost:3000/api/invitations/${invitation.id}/submissions`,
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
