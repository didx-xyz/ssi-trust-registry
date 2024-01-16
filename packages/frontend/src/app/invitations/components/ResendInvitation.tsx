'use client'
import React, { useEffect, useState } from 'react'
import { TextSmBold } from '@/common/components/Typography'
import { backendUrl, betterFetch } from '@/api'
import { getResendButtonColor, getResendButtonText } from '@/common/helpers'
import { ResendButtonState } from '@/common/constants'

interface Props {
  invitationId: string
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
        className={`cursor-pointer text-${getResendButtonColor(buttonState)}`}
        onClick={() => onResendInvitation(invitationId)}
      >
        {getResendButtonText(buttonState)}
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
    console.log(error)
  }
}
