import nodemailer from 'nodemailer'
import { createEmailClient } from '../email/client'

export async function createFakeEmailClient() {
  const testAccount = await nodemailer.createTestAccount()
  return createEmailClient({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
}
