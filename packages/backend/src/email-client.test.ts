import { config } from './config'
import {
  EmailClient,
  createEmailClient,
} from '@ssi-trust-registry/backend/src/email-client'

describe('EmailClient', () => {
  let emailClient: EmailClient

  beforeAll(async () => {
    emailClient = createEmailClient(config.smtp)
  })

  describe('sendMail', () => {
    test('should send an email', async () => {
      const to = 'test@example.com'
      const subject = 'Test Email'
      const text = 'This is a test email'
      const info = await emailClient.sendMail(to, subject, text)
      expect(info.accepted).toContain(to)
    })
  })
})
