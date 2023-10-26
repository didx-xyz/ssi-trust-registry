import partial from 'lodash.partial'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'

export interface EmailClient {
  sendMail: (
    to: string,
    subject: string,
    text: string,
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
