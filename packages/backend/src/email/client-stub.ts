import { compileEmailTemplate } from './helpers'

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
  failNextSend: () => void
  sentMessages: SentMessage[]
}

export function createEmailClientStub(): EmailClientStub {
  const sentMessages: SentMessage[] = []
  let shouldFailNextSend = false
  return {
    async sendMailFromTemplate(
      to: string,
      subject: string,
      templatePath: string,
      templateParams: Record<string, unknown>,
    ) {
      if (shouldFailNextSend) {
        shouldFailNextSend = false
        throw new Error('Failed to send email')
      }
      const html = await compileEmailTemplate(templatePath, templateParams)
      sentMessages.push({ to, subject, html })
    },
    failNextSend() {
      shouldFailNextSend = true
    },
    sentMessages,
  }
}
