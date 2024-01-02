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
  sentMessages: SentMessage[]
  failNextSend: () => void
}

export function createEmailClientStub(): EmailClientStub {
  const sentMessages: SentMessage[] = []
  let _failNextSend = false
  return {
    async sendMailFromTemplate(
      to: string,
      subject: string,
      templatePath: string,
      templateParams: Record<string, unknown>,
    ) {
      if (_failNextSend) {
        _failNextSend = false
        throw new Error('Failed to send email')
      }
      const html = await compileEmailTemplate(templatePath, templateParams)
      sentMessages.push({ to, subject, html })
    },
    failNextSend() {
      _failNextSend = true
    },
    sentMessages,
  }
}
