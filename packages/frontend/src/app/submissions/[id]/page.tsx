import { betterFetch } from '@/api'
import { Button } from '@/common/components/Button'
import { Label } from '@/common/components/Label'
import { Text2xlBold, TextSmBold } from '@/common/components/Typography'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { getAuthToken } from '@/common/helpers'
import { Submission } from '@/common/interfaces'
import Image from 'next/image'
import { RejectButton } from './components/RejectButton'
import { ApproveButton } from './components/ApproveButton'

export default async function SubmissionDetail({
  params,
}: {
  params: { id: string }
}) {
  const authToken = getAuthToken()
  const { id } = params
  console.log(id)
  const submission = await getSubmission(id, authToken)
  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/submissions', title: 'Submissions' },
          { href: `/submissions/${id}`, title: submission.name },
        ]}
      />
      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              className="mr-2"
              src={submission.logo_url}
              alt={submission.name}
              width={100}
              height={100}
            />
            <Text2xlBold>{submission.name}</Text2xlBold>
          </div>
          <div className="w-full text-left flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label>Entity Name</Label>
              <TextSmBold>{submission.name}</TextSmBold>
            </div>
            <div className="flex flex-col gap-1">
              <Label>DIDs</Label>
              {submission.dids.map((did) => (
                <TextSmBold key={did}>{did}</TextSmBold>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Domain</Label>
              <TextSmBold>{submission.domain}</TextSmBold>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Role(s)</Label>
              <div className="capitalize">
                <TextSmBold>{submission.role.join(', ')}</TextSmBold>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Schema IDs</Label>
              {submission.credentials.map((schemaId) => (
                <TextSmBold key={schemaId}>{schemaId}</TextSmBold>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Logo URL (SVG Format)</Label>
              <TextSmBold>{submission.logo_url}</TextSmBold>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Submitter&apos;s Email Address</Label>
              <TextSmBold>{submission.emailAddress}</TextSmBold>
            </div>
          </div>
          <div className="card-actions gap-4">
            <RejectButton submissionId={id} authToken={authToken} />
            <ApproveButton submissionId={id} authToken={authToken} />
          </div>
        </div>
      </div>
    </main>
  )
}

async function getSubmission(
  id: string,
  authToken?: string,
): Promise<Submission & { emailAddress: string }> {
  const submission = await betterFetch(
    'GET',
    `http://localhost:3000/api/submissions/${id}`,
    {
      Cookie: `token=${authToken}`,
    },
  )
  const invitation = await betterFetch(
    'GET',
    `http://localhost:3000/api/invitations/${submission.invitationId}`,
    {
      Cookie: `token=${authToken}`,
    },
  )
  return { ...submission, emailAddress: invitation.emailAddress }
}
