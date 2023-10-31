import fs from 'node:fs/promises'
import handlebars from 'handlebars'

export async function compileEmailTemplate(
  templatePath: string,
  templateParams: Record<string, unknown>,
) {
  const html = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const template = handlebars.compile(html)
  return template(templateParams)
}
