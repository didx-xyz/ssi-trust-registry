import dotenv from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config()
}

const ConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    url: z.string(),
  }),
  logger: z.object({
    logLevel: z.enum(['error', 'warn', 'info', 'http', 'debug', 'verbose']),
    outputFormat: z.enum(['cli', 'json']),
  }),
  db: z.object({
    connectionString: z.string(),
    name: z.string(),
  }),
})

type Config = z.infer<typeof ConfigSchema>

export const config: Config = ConfigSchema.parse({
  server: {
    port: process.env.PORT,
    url: process.env.URL,
  },
  logger: {
    logLevel: process.env.LOGGER_LOG_LEVEL || 'http',
    outputFormat: process.env.LOGGER_OUTPUT_FORMAT || 'cli',
  },
  db: {
    connectionString: process.env.DB_CONNECTION_STRING,
    name: process.env.DB_NAME,
  },
})

export function hideSecrets(config: Config) {
  return {
    ...config,
    db: {
      ...config.db,
      connectionString: config.db.connectionString.replace(
        /(?<=:)(?:(?!:).)*(?=@)/,
        '*****',
      ),
    },
  }
}
