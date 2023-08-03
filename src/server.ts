import express from 'express'
import { Server } from 'node:http'
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
import { addSubmission, getAllSubmissions } from './submission/service'
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
        logger.info(`Processing submission:`, payload)
        const submission = await addSubmission(payload)
        res.status(201).json(submission)
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
