import { compileEmailTemplate, getSubmitUrls } from './helpers'
import { Invitation } from '@ssi-trust-registry/common'

type SentMessage = {
  to: string
  subject: string
  html: string
}

export interface EmailClientStub {
  sendMailFromTemplate: (
    to: string,
    subject: string,
    templatePath: string,
    templateParams: Record<string, unknown>,
  ) => Promise<void>
  sendInvitationEmail: (invitation: Invitation) => Promise<void>
  sentMessages: SentMessage[]
}

export function createEmailClientStub(): EmailClientStub {
  const sentMessages: SentMessage[] = []
  return {
    async sendMailFromTemplate(
      to: string,
      subject: string,
      templatePath: string,
      templateParams: Record<string, unknown>,
    ) {
      const html = await compileEmailTemplate(templatePath, templateParams)
      sentMessages.push({ to, subject, html })
    },
    async sendInvitationEmail(invitation: Invitation) {
      const { submitApiUrl, submitUiUrl } = getSubmitUrls(invitation)
      await this.sendMailFromTemplate(
        invitation.emailAddress,
        'Invitation',
        './src/email/templates/invitation.html',
        {
          submitApiUrl,
          submitUiUrl,
        },
      )
    },
    sentMessages,
  }
}
