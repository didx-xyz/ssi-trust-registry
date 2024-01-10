import fs from 'node:fs/promises'
import handlebars from 'handlebars'
import { Invitation } from '../submission/domain'
import { config } from '../config'

export async function compileEmailTemplate(
  templatePath: string,
  templateParams: Record<string, unknown>,
) {
  const html = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const template = handlebars.compile(html)
  return template(templateParams)
}

export function getSubmitUrls(invitation: Invitation) {
  const submitApiUrl = `https://${config.server.url}:${config.server.port}/api/submissions`
  const submitUiUrl = `${config.server.frontendUrl}/submit/${invitation.id}`
  return {
    submitApiUrl,
    submitUiUrl,
  }
}
