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
  getSentMessages: () => SentMessage[]
  clearSentMessages: () => void
}

export function createEmailClientStub(): EmailClientStub {
  let sentMessages: SentMessage[] = []
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
    getSentMessages() {
      return sentMessages
    },
    clearSentMessages() {
      sentMessages = []
    },
  }
}
