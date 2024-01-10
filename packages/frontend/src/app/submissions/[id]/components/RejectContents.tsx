import Failure from '@/common/assets/Failure.svg'
import { Button } from '@/common/components/Button'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import { SubmissionWithEmail } from '@/common/interfaces'

export function RejectContents({
  submission,
}: {
  submission?: SubmissionWithEmail
}) {
  return (
    <>
      <Failure />
      <div className="flex flex-col gap-2 text-center">
        <Text2xlBold>Rejected</Text2xlBold>
        <TextSm>{submission?.name} will receive an email with rejection</TextSm>
      </div>
      <Button href="/submissions" title="Back to submissions" />
    </>
  )
}
