import partial from 'lodash.partial'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'
import { compileEmailTemplate, getSubmitUrls } from './helpers'
import { Invitation } from '../submission/domain'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

export interface EmailClient {
  sendMailFromTemplate: (
    to: string,
    subject: string,
    templatePath: string,
    templateParams: Record<string, unknown>,
  ) => Promise<SentMessageInfo>
  sendInvitationEmail: (invitation: Invitation) => Promise<void>
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
    sendInvitationEmail: partial(sendInvitationEmail, transporter),
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

async function sendInvitationEmail(
  transporter: Transporter,
  invitation: Invitation,
) {
  const { submitApiUrl, submitUiUrl } = getSubmitUrls(invitation)
  logger.info(`Sending invitation via email to: `, invitation.emailAddress)
  await sendMailFromTemplate(
    transporter,
    invitation.emailAddress,
    'Invitation',
    './src/email/templates/invitation.html',
    {
      submitApiUrl,
      submitUiUrl,
    },
  )
}
