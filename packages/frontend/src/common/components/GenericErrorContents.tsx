import Failure from '@/common/assets/Failure.svg'
import { Text2xlBold, TextSm } from './Typography'
import { Button } from './Button'

export function GenericErrorContents() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <Failure />
      <div className="flex flex-col gap-2">
        <Text2xlBold>Oops, something went wrong</Text2xlBold>
        <TextSm>
          Try to refresh the page. If the issue persists, contact us at
          lorem@ipsum.com
        </TextSm>
      </div>
      <Button onClick={() => location.reload()} title="Refresh" />
    </div>
  )
}
