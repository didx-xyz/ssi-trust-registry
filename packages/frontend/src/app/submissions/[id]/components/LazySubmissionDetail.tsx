import Image from 'next/image'
import { Text2xlBold, TextSmBold } from '@/common/components/Typography'
import { Submission } from '@/common/interfaces'
import { Label } from '@/common/components/Label'

export function LazySubmissionDetail({
  submission,
}: {
  submission?: Submission & { emailAddress: string }
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {submission ? (
          <>
            <Image
              className="mr-2"
              src={submission.logo_url}
              alt={submission.name}
              width={100}
              height={100}
            />
            <Text2xlBold>{submission.name}</Text2xlBold>
          </>
        ) : (
          <>
            <div className="h-20 w-20 bg-slate-200 animate-pulse rounded-full" />
            <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-sm" />
          </>
        )}
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
          {submission ? (
            submission.dids.map((did) => (
              <TextSmBold key={did}>{did}</TextSmBold>
            ))
          ) : (
            <>
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
            </>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Domain</Label>
          {submission ? (
            <TextSmBold>{submission.domain}</TextSmBold>
          ) : (
            <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Role(s)</Label>
          <div className="capitalize">
            {submission ? (
              <TextSmBold>{submission.role.join(', ')}</TextSmBold>
            ) : (
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-sm" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Schema IDs</Label>
          {submission ? (
            submission.credentials.map((schemaId) => (
              <TextSmBold key={schemaId}>{schemaId}</TextSmBold>
            ))
          ) : (
            <>
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
            </>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Logo URL (SVG Format)</Label>
          {submission ? (
            <TextSmBold>{submission.logo_url}</TextSmBold>
          ) : (
            <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Submitter&apos;s Email Address</Label>
          {submission ? (
            <TextSmBold>{submission.emailAddress}</TextSmBold>
          ) : (
            <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </>
  )
}
