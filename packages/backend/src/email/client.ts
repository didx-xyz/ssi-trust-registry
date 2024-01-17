import partial from 'lodash.partial'
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'
import { compileEmailTemplate, getEntityUrl, getSubmitUrls } from './helpers'
import { Invitation } from '@ssi-trust-registry/common'
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
  sendApprovalEmail: (invitation: Invitation, entityId: string) => Promise<void>
  sendRejectionEmail: (invitation: Invitation) => Promise<void>
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
    sendApprovalEmail: partial(sendApprovalEmail, transporter),
    sendRejectionEmail: partial(sendRejectionEmail, transporter),
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
  logger.info(`Sending submission approved email to: `, invitation.emailAddress)
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

async function sendApprovalEmail(
  transporter: Transporter,
  invitation: Invitation,
  entityId: string,
) {
  const entityUrl = getEntityUrl(entityId)
  logger.info(`Sending submission approved email to: `, invitation.emailAddress)
  await sendMailFromTemplate(
    transporter,
    invitation.emailAddress,
    'Congratulations! Your submission has been approved!',
    './src/email/templates/approved.html',
    {
      entityUrl,
    },
  )
}

async function sendRejectionEmail(
  transporter: Transporter,
  invitation: Invitation,
) {
  const { submitUiUrl } = getSubmitUrls(invitation)
  logger.info(`Sending submission rejected email to: `, invitation.emailAddress)
  await sendMailFromTemplate(
    transporter,
    invitation.emailAddress,
    'Sorry. Your submission has been rejected.',
    './src/email/templates/rejected.html',
    {
      submitUiUrl,
    },
  )
}
