import { compileEmailTemplate } from '../email/helpers'

type SentMessage = {
  to: string
  subject: string
  text?: string
  html?: string
}

export interface EmailClientStub {
  sendMail: (to: string, subject: string, text: string) => Promise<void>
  sendMailFromTemplate: (
    to: string,
    subject: string,
    templatePath: string,
    templateParams: Record<string, unknown>,
  ) => Promise<void>
  sentMessages: SentMessage[]
}

export function createEmailClientStub(): EmailClientStub {
  const sentMessages: SentMessage[] = []
  return {
    async sendMail(to: string, subject: string, text: string) {
      sentMessages.push({ to, subject, text })
      return Promise.resolve()
    },
    async sendMailFromTemplate(
      to: string,
      subject: string,
      templatePath: string,
      templateParams: Record<string, unknown>,
    ) {
      const html = await compileEmailTemplate(templatePath, templateParams)
      sentMessages.push({ to, subject, html })
    },
    sentMessages,
  }
}
