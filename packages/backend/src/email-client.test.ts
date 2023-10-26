import { EmailClient } from '@ssi-trust-registry/backend/src/email-client'
import { createFakeEmailClient } from './__tests__/helpers'

describe('EmailClient', () => {
  let emailClient: EmailClient

  beforeAll(async () => {
    emailClient = await createFakeEmailClient()
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
