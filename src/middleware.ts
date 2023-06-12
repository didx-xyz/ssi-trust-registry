import type { Request, Response, NextFunction } from 'express'

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
