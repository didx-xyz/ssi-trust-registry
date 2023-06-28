import express from 'express'
import { Server } from 'node:http'
import fs from 'node:fs/promises'
import {
  asyncHandler,
  errorHandler,
  generateSwaggerDocs,
  httpContext,
  httpContextRequestId,
  httpLogger,
  swaggerDocs,
} from './middleware'
import { createLogger } from './logger'

const logger = createLogger(__filename)

export function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const port = 3000
    const url = 'http://localhost'
    const app = express()

    app.use(httpContext)
    app.use(httpContextRequestId)
    app.use(httpLogger)

    app.set('json spaces', 2)

    if (process.env.NODE_ENV !== 'production') {
      const swaggerDocsJson = generateSwaggerDocs()
      app.use('/api/docs', ...swaggerDocs(port, swaggerDocsJson))
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
        const registryContent = await fs.readFile('./src/registry.json', {
          encoding: 'utf8',
        })
        res.status(200).json(JSON.parse(registryContent))
      })
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
