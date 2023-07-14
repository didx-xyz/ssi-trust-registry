import express from 'express'
import { Server } from 'node:http'
import { ZodError } from 'zod'
import {
  asyncHandler,
  disableInProduction,
  errorHandler,
  httpContext,
  httpContextRequestId,
  httpLogger,
  swaggerDocs,
} from './middleware'
import { createLogger } from './logger'
import { generateSwaggerDocs } from './api-doc'
import { addSubmission, getAllSubmissions, parseSubmission } from './submission'
import { getRegistry } from './registry'

const logger = createLogger(__filename)

interface ServerConfig {
  port: number
  url: string
}

export function startServer(config: ServerConfig): Promise<Server> {
  return new Promise((resolve, reject) => {
    const { port, url } = config
    const app = express()

    app.use(express.json())
    app.use(httpContext)
    app.use(httpContextRequestId)
    app.use(httpLogger)

    app.set('json spaces', 2)

    if (process.env.NODE_ENV !== 'production') {
      const swaggerDocsJson = JSON.parse(JSON.stringify(generateSwaggerDocs()))
      app.use('/api/docs', ...swaggerDocs(url, port, swaggerDocsJson))
      app.get('/api/docs-json', (_, res) => {
        res.json(swaggerDocsJson)
      })
    }

    app.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    app.get(
      '/registry',
      asyncHandler(async (req, res) => {
        logger.info('Reading the registry from the file.')
        const registry = await getRegistry()
        res.status(200).json(registry)
      }),
    )

    app.get(
      '/submissions',
      disableInProduction,
      asyncHandler(async (req, res) => {
        logger.info('Reading the registry from the file.')
        const submissions = await getAllSubmissions()
        res.status(200).json(submissions)
      }),
    )

    app.post(
      '/submissions',
      disableInProduction,
      asyncHandler(async (req, res) => {
        const payload = req.body
        logger.info(
          `Processing submission:\n ${JSON.stringify(payload, null, 2)}`,
        )
        try {
          const submission = await addSubmission(parseSubmission(payload))
          res.status(201).json(submission)
        } catch (error) {
          if (error instanceof ZodError) {
            logger.error(
              `Could not parse submission: \n ${JSON.stringify(
                error.issues,
                null,
                2,
              )}`,
            )
            res.status(400).json({ error: error.issues })
          } else {
            throw error
          }
        }
      }),
    )

    app.use(errorHandler)

    const server = app.listen(port, (error?: Error) => {
      if (error) {
        reject(error)
      } else {
        console.log(`Server is running on ${url}:${port}`)
        resolve(server)
      }
    })
  })
}
