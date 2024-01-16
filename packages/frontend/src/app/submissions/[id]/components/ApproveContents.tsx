import Success from '@/common/assets/Success.svg'
import { Text2xlBold, TextSm } from '@/common/components/Typography'
import { Button } from '@/common/components/Button'
import { SubmissionWithEmail } from '@/common/interfaces'

export function ApproveContents({
  submission,
}: {
  submission?: SubmissionWithEmail
}) {
  return (
    <>
      <Success />
      <div className="flex flex-col gap-2 text-center">
        <Text2xlBold>Approved</Text2xlBold>
        <TextSm>{submission?.name} will receive an email with approval</TextSm>
      </div>
      <Button href="/submissions" title="Back to submissions" />
    </>
  )
}
