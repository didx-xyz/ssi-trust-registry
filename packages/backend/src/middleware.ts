import type { Request, Response, NextFunction, RequestHandler } from 'express'
import expressHttpContext from 'express-http-context'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import swaggerUi from 'swagger-ui-express'
import { ZodError } from 'zod'
import { createLogger } from './logger'
import { RequestWithToken } from './auth/middleware'
import { FieldError } from './errors'

const logger = createLogger(__filename)

/**
 * @see https://zellwk.com/blog/async-await-express/
 */
export function asyncHandler(
  fn: (
    req: RequestWithToken,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
) {
  return async (
    req: RequestWithToken,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

/**
 * @see https://zellwk.com/blog/async-await-express/
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // The parameter `next` must be defined for the function to be called as middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  logger.error('Error handler caught an error:', error, error.message)
  if (error instanceof ZodError) {
    logger.error(`Could not parse submission`, error.issues)
    res.status(400).json({ error: error.issues })
  } else if (error instanceof FieldError) {
    logger.error(`Field error: ${error.field}`, error.message)
    res.status(400).json({ error: error.message, field: error.field })
  } else {
    res.status(500).json({ error: error.message || 'Unexpected error' })
  }
}

export const httpContext = expressHttpContext.middleware
export function httpContextRequestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = req.header('X-Request-ID') || uuidv4()
  expressHttpContext.set('requestId', requestId)
  next()
}

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  },
)
export function httpLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.url === '/health' || req.headers.upgrade === 'websocket') {
    next()
  } else {
    morganMiddleware(req, res, next)
  }
}

export function swaggerDocs(
  url: string,
  port: number,
  openApiDocs: Record<string, unknown>,
): [RequestHandler[], RequestHandler] {
  const uiOptions = {
    swaggerOptions: {
      url: `${url}:${port}/api/docs-json`,
    },
  }
  return [swaggerUi.serve, swaggerUi.setup(openApiDocs, uiOptions)]
}

export function disableInProduction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (process.env.NODE_ENV === 'production') {
    logger.info(`Endpoint ${req.path} is disabled in production.`)
    res.status(500).json({ error: 'Endpoint is disabled' })
  } else {
    next()
  }
}
