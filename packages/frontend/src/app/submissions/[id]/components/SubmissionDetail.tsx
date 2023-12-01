import Image from 'next/image'
import { Text2xlBold, TextSmBold } from '@/common/components/Typography'
import { Submission } from '@/common/interfaces'
import { Label } from '@/common/components/Label'

export function SubmissionDetail({
  submission,
}: {
  submission?: Submission & { emailAddress: string }
}) {
  return (
    submission && (
      <>
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
            {submission ? (
              <TextSmBold>{submission.name}</TextSmBold>
            ) : (
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-sm" />
            )}
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
      </>
    )
  )
}
