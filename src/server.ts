import express from 'express'
import { Server } from 'node:http'
import fs from 'node:fs/promises'
import {
  asyncHandler,
  errorHandler,
  httpContext,
  httpContextRequestId,
  httpLogger,
} from './middleware'
import { createLogger } from './logger'

const logger = createLogger(__filename)

export function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const port = 3000
    const app = express()

    app.use(httpContext)
    app.use(httpContextRequestId)
    app.use(httpLogger)

    app.set('json spaces', 2)

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
        console.log(`Server is running on port ${port}`)
        resolve(server)
      }
    })
  })
}
