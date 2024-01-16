import { cookies } from 'next/headers'
import { ResendButtonState } from '@/common/constants'

export function getAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value
}

export function getResendButtonColor(buttonState: string) {
  const buttonColorByState = {
    [ResendButtonState.Initial]: 'accent',
    [ResendButtonState.Resent]: 'success',
    [ResendButtonState.Failed]: 'error',
  }
  return buttonColorByState[buttonState]
}

export function getResendButtonText(buttonState: string) {
  const buttonTextByState = {
    [ResendButtonState.Initial]: 'Resend',
    [ResendButtonState.Sending]: 'Sending...',
    [ResendButtonState.Resent]: 'Done',
    [ResendButtonState.Failed]: 'Failed',
  }
  return buttonTextByState[buttonState]
}
