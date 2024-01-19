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
    sentMessages,
  }
}
