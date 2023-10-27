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
import { EntityService } from './entity/service'
import { SchemaService } from './schema/service'
import { SubmissionService } from './submission/service'

const logger = createLogger(__filename)

interface ServerConfig {
  port: number
  url: string
}

interface Context {
  entityService: EntityService
  schemaService: SchemaService
  submissionService: SubmissionService
}

export function startServer(
  config: ServerConfig,
  context: Context,
): Promise<Server> {
  return new Promise((resolve, reject) => {
    const { port, url } = config
    const app = express()

    app.use(express.json())
    app.use(httpContext)
    app.use(httpContextRequestId)
    app.use(httpLogger)

    app.set('json spaces', 2)

    const apiRouter = express.Router()
    app.use('/api', apiRouter)

    if (process.env.NODE_ENV !== 'production') {
      const swaggerDocsJson = JSON.parse(JSON.stringify(generateSwaggerDocs()))
      apiRouter.use('/docs', ...swaggerDocs(url, port, swaggerDocsJson))
      apiRouter.get('/docs-json', (_, res) => {
        res.json(swaggerDocsJson)
      })
    }

    app.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    apiRouter.get(
      '/registry',
      asyncHandler(async (req, res) => {
        logger.info('Reading the registry from the file.')
        const registry = {
          entities: await context.entityService.getAllEntities(),
          schemas: await context.schemaService.getAllSchemas(),
        }
        res.status(200).json(registry)
      }),
    )

    apiRouter.get(
      '/submissions',
      asyncHandler(async (req, res) => {
        logger.info('Reading the registry from the file.')
        const submissions = await context.submissionService.getAllSubmissions()
        res.status(200).json(submissions)
      }),
    )

    apiRouter.post(
      '/submissions/:invitationId',
      asyncHandler(async (req, res) => {
        const payload = { ...req.body, invitationId: req.params.invitationId }
        logger.info(`Processing submission:`, payload)
        const submission =
          await context.submissionService.addSubmission(payload)
        res.status(201).json(submission)
      }),
    )

    apiRouter.post(
      '/invitation',
      disableInProduction,
      asyncHandler(async (req, res) => {
        const payload = req.body
        console.log(payload)
        logger.info(`Sending invitation to:`, payload.emailAddress)
        const invitation = await context.submissionService.generateInvitation(
          `${config.url}:${config.port}`,
          payload,
        )
        res.status(200).json(invitation)
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
