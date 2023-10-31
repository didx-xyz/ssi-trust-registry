import partial from 'lodash.partial'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'
import { compileEmailTemplate } from './helpers'

export interface EmailClient {
  sendMail: (
    to: string,
    subject: string,
    text: string,
  ) => Promise<SentMessageInfo>
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
    sendMail: partial(sendMail, transporter),
    sendMailFromTemplate: partial(sendMailFromTemplate, transporter),
  }
}

function sendMail(
  transporter: Transporter,
  to: string,
  subject: string,
  text: string,
): Promise<SentMessageInfo> {
  return transporter.sendMail({
    to,
    subject,
    text,
  })
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
