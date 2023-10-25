import partial from 'lodash.partial'
import nodemailer, { Transporter } from 'nodemailer'

export interface EmailClient {
  sendMail: (to: string, subject: string, text: string) => Promise<void>
}

interface SmtpConfig {
  host: string
  port: number
  auth: {
    user: string
    pass: string
  }
}

export function createEmailClient(config: SmtpConfig) {
  const transporter = nodemailer.createTransport(config)
  return {
    sendMail: partial(sendMail, transporter),
  }
}

export async function sendMail(
  transporter: Transporter,
  to: string,
  subject: string,
  text: string,
) {
  const info = await transporter.sendMail({
    to,
    subject,
    text,
  })

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
