import partial from 'lodash.partial'
import fs from 'node:fs/promises'
import handlebars from 'handlebars'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'

export interface EmailClient {
  sendMail: (
    to: string,
    subject: string,
    html: string,
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
  html: string,
): Promise<SentMessageInfo> {
  return transporter.sendMail({
    to,
    subject,
    html,
  })
}

async function sendMailFromTemplate(
  transporter: Transporter,
  to: string,
  subject: string,
  templatePath: string,
  templateParams: Record<string, unknown>,
): Promise<SentMessageInfo> {
  const html = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const template = handlebars.compile(html)
  return transporter.sendMail({
    to,
    subject,
    html: template(templateParams),
  })
}
