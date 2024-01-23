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
import { generateSwaggerDocs } from './api-doc'
import { authenticate } from './auth/middleware'
import { Context } from './context'

interface ServerConfig {
  port: number
  url: string
  frontendUrl: string
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
      const swaggerDocsJson = JSON.parse(
        JSON.stringify(generateSwaggerDocs(context)),
      )
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
      asyncHandler(context.entityController.getRegistry),
    )

    apiRouter.get(
      '/submissions',
      authenticate,
      asyncHandler(context.submissionController.getAllSubmissions),
    )

    apiRouter.get(
      '/submissions/:id',
      authenticate,
      asyncHandler(context.submissionController.getSubmissionById),
    )

    apiRouter.put(
      '/submissions/:id',
      authenticate,
      asyncHandler(context.submissionController.updateSubmissionState),
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

    apiRouter.post(
      '/invitations/:id/resend',
      authenticate,
      asyncHandler(context.submissionController.resendInvitation),
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
