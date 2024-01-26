import { Invitation } from '@ssi-trust-registry/common'
import partial from 'lodash.partial'
import { EmailClient } from './client'
import { getEntityUrl, getSubmitUrls } from './helpers'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

export interface EmailService {
  sendInvitationEmail: (invitation: Invitation) => Promise<void>
  sendApprovalEmail: (invitation: Invitation, entityId: string) => Promise<void>
  sendRejectionEmail: (invitation: Invitation) => Promise<void>
}

export async function createEmailService(
  emailClient: EmailClient,
): Promise<EmailService> {
  return {
    sendInvitationEmail: partial(sendInvitationEmail, emailClient),
    sendApprovalEmail: partial(sendApprovalEmail, emailClient),
    sendRejectionEmail: partial(sendRejectionEmail, emailClient),
  }
}

async function sendInvitationEmail(
  emailClient: EmailClient,
  invitation: Invitation,
) {
  const { submitApiUrl, submitUiUrl } = getSubmitUrls(invitation)
  logger.info(`Sending invitation email to: `, invitation.emailAddress)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'SSI Trust Registry - Invitation',
    './src/email/templates/invitation.html',
    {
      submitApiUrl,
      submitUiUrl,
    },
  )
}

async function sendApprovalEmail(
  emailClient: EmailClient,
  invitation: Invitation,
  entityId: string,
) {
  const entityUrl = getEntityUrl(entityId)
  logger.info(`Sending submission approved email to: `, invitation.emailAddress)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'SSI Trust Registry - Submission Approved',
    './src/email/templates/approved.html',
    {
      entityUrl,
    },
  )
}

async function sendRejectionEmail(
  emailClient: EmailClient,
  invitation: Invitation,
) {
  logger.info(`Sending submission rejected email to: `, invitation.emailAddress)
  await emailClient.sendMailFromTemplate(
    invitation.emailAddress,
    'SSI Trust Registry - Submission Rejected',
    './src/email/templates/rejected.html',
    {},
  )
}
