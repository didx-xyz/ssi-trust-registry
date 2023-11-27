import express from 'express'
import { Server } from 'node:http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {
  asyncHandler,
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
import { AuthController } from './auth/controller'
import { authenticate } from './auth/middleware'
import { SubmissionController } from './submission/controller'

const logger = createLogger(__filename)

interface ServerConfig {
  port: number
  url: string
  frontendUrl: string
}

interface Context {
  entityService: EntityService
  schemaService: SchemaService
  submissionService: SubmissionService
  submissionController: SubmissionController
  authController: AuthController
}

export function startServer(
  config: ServerConfig,
  context: Context,
): Promise<Server> {
  return new Promise((resolve, reject) => {
    const { port, url } = config
    const app = express()

    const corsOptions = {
      origin: config.frontendUrl, // Replace with your frontend URL
      credentials: true, // Allow cookies to be sent
    }
    app.use(cors(corsOptions))
    app.use(express.json())
    app.use(httpContext)
    app.use(httpContextRequestId)
    app.use(httpLogger)
    app.use(cookieParser())

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
      authenticate,
      asyncHandler(context.submissionController.getAllSubmissions),
    )

    apiRouter.post(
      '/submissions',
      asyncHandler(context.submissionController.createSubmission),
    )

    apiRouter.get(
      '/invitations',
      authenticate,
      asyncHandler(context.submissionController.getAllInvitations),
    )

    apiRouter.get(
      '/invitations/:id',
      asyncHandler(context.submissionController.getInvitationById),
    )

    apiRouter.get(
      '/invitations/:id/submissions',
      authenticate,
      asyncHandler(context.submissionController.getSubmissionsByInvitationId),
    )

    apiRouter.post(
      '/invitations',
      authenticate,
      asyncHandler(context.submissionController.createInvitation),
    )

    apiRouter.post('/auth/login', asyncHandler(context.authController.logIn))
    apiRouter.get('/auth/logout', asyncHandler(context.authController.logOut))
    apiRouter.get(
      '/auth/whoami',
      authenticate,
      asyncHandler(context.authController.getUser),
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
