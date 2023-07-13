import { z } from 'zod'

const ConfigSchema = z.object({
  port: z.coerce.number(),
  url: z.string(),
  logger: z.object({
    logLevel: z.enum(['error', 'warn', 'info', 'http', 'debug', 'verbose']),
    outputFormat: z.enum(['cli', 'json']),
  }),
})

type Config = z.infer<typeof ConfigSchema>

if (process.env.NODE_ENV === 'test') {
  process.env.PORT = ''
  process.env.URL = ''
}

export const config: Config = ConfigSchema.parse({
  port: process.env.PORT,
  url: process.env.URL,
  logger: {
    logLevel: process.env.LOGGER_LOG_LEVEL || 'http',
    outputFormat: process.env.LOGGER_OUTPUT_FORMAT || 'cli',
  },
})
