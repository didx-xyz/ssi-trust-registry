'use client'
import React, { useEffect, useState } from 'react'
import { TextSmBold } from '@/common/components/Typography'
import { backendUrl, betterFetch } from '@/api'

interface Props {
  invitationId: string
}

const ResendButtonState = {
  Initial: 'Initial',
  Sending: 'Sending',
  Resent: 'Resent',
  Failed: 'Failed',
}

export function ResendInvitation({ invitationId }: Props) {
  const [buttonState, setButtonState] = useState(ResendButtonState.Initial)

  async function onResendInvitation(invitationId: string) {
    try {
      if (buttonState == ResendButtonState.Initial) {
        setButtonState(ResendButtonState.Sending)
        await resendInvitation(invitationId)
        setButtonState(ResendButtonState.Resent)
      }
    } catch (error) {
      console.log(error)
      setButtonState(ResendButtonState.Failed)
    }
  }

  function getResendButtonColor() {
    if (buttonState === ResendButtonState.Resent) {
      return 'success'
    } else if (buttonState === ResendButtonState.Failed) {
      return 'error'
    }

    return 'primary'
  }

  function getResendButtonText() {
    const resendButtonTitleMap = {
      [ResendButtonState.Initial]: 'Resend invitation',
      [ResendButtonState.Sending]: 'Sending...',
      [ResendButtonState.Resent]: 'Invitation resent',
      [ResendButtonState.Failed]: 'Resending failed',
    }
    return resendButtonTitleMap[buttonState]
  }

  useEffect(() => {
    if (
      buttonState !== ResendButtonState.Resent ||
      buttonState !== ResendButtonState.Failed
    ) {
      setTimeout(() => {
        setButtonState(ResendButtonState.Initial)
      }, 5000)
    }
  }, [buttonState])

  return (
    <TextSmBold>
      <span
        className={`cursor-pointer text-${getResendButtonColor()}`}
        onClick={() => onResendInvitation(invitationId)}
      >
        {getResendButtonText()}
      </span>
    </TextSmBold>
  )
}

async function resendInvitation(invitationId: any) {
  try {
    return betterFetch(
      'POST',
      `${backendUrl}/api/invitations/${invitationId}/resend`,
    )
  } catch (error) {
    return []
  }
}
