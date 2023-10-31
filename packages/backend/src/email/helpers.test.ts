import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { compileEmailTemplate } from './helpers'

describe('compileEmailTemplate', () => {
  it('should compile email template with given parameters', async () => {
    const content = '<h1>Hello {{{name}}}</h1>'
    const tmpFile = path.join(os.tmpdir(), 'template.html')
    await fs.writeFile(tmpFile, content)
    const templateParams = { name: 'John' }
    const result = await compileEmailTemplate(tmpFile, templateParams)
    expect(result).toContain('<h1>Hello John</h1>')
  })
})
