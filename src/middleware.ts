import type { Request, Response, NextFunction, RequestHandler } from 'express'
import expressHttpContext from 'express-http-context'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import swaggerUi from 'swagger-ui-express'
import { createLogger } from './logger'

const logger = createLogger(__filename)

/**
 * @see https://zellwk.com/blog/async-await-express/
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
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
  next: NextFunction
): void {
  console.error('Error handler caught an error:', error, error.message)
  res.status(500)
  res.json({ error: error.message || 'Unexpected error' })
}

export const httpContext = expressHttpContext.middleware
export function httpContextRequestId(
  req: Request,
  res: Response,
  next: NextFunction
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
  }
)
export function httpLogger(
  req: Request,
  res: Response,
  next: NextFunction
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
  openApiDocs: Record<string, unknown>
): [RequestHandler[], RequestHandler] {
  const uiOptions = {
    swaggerOptions: {
      url: `${url}:${port}/api/docs-json`,
    },
  }
  return [swaggerUi.serve, swaggerUi.setup(openApiDocs, uiOptions)]
}
