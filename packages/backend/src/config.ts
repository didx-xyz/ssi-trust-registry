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
  smtp: z.object({
    host: z.string(),
    port: z.coerce.number(),
    auth: z.object({
      user: z.string(),
      pass: z.string(),
    }),
  }),
  skipInitialDataLoad: z.boolean(),
  jwtSecretKey: z.string(),
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
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  skipInitialDataLoad: process.env.SKIP_INITIAL_DATA_LOAD === 'true',
  jwtSecretKey: process.env.JWT_SECRET_KEY,
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
    smtp: {
      ...config.smtp,
      auth: {
        ...config.smtp.auth,
        pass: '*****',
      },
    },
  }
}
