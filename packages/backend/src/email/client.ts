import partial from 'lodash.partial'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'
import { compileEmailTemplate } from './helpers'

export interface EmailClient {
  sendMailFromTemplate: (
    to: string,
    subject: string,
    templatePath: string,
    templateParams: Record<string, unknown>,
  ) => Promise<SentMessageInfo>
}

interface SmtpConfig {
  host: string
  port: number
  auth: {
    user: string
    pass: string
  }
}

export function createEmailClient(config: SmtpConfig): EmailClient {
  const transporter = nodemailer.createTransport(config)
  return {
    sendMailFromTemplate: partial(sendMailFromTemplate, transporter),
  }
}

async function sendMailFromTemplate(
  transporter: Transporter,
  to: string,
  subject: string,
  templatePath: string,
  templateParams: Record<string, unknown>,
): Promise<SentMessageInfo> {
  const html = await compileEmailTemplate(templatePath, templateParams)
  return transporter.sendMail({
    to,
    subject,
    html,
  })
}
