import nodemailer from 'nodemailer'
import { createEmailClient } from '../email-client'

export async function createFakeEmailClient() {
  const testAccount = await nodemailer.createTestAccount()
  const transporter = createEmailClient({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
  return transporter
}
