import type { Logger } from 'winston'
import winston from 'winston'
import httpContext from 'express-http-context'
import path from 'node:path'

const config = {
  logger: {
    logLevel: 'http',
    outputFormat: 'cli',
  },
}
const { combine, timestamp, json, colorize, printf } = winston.format

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug' | 'verbose'

const requestId = winston.format((info) => {
  info.requestId = httpContext.get('requestId')
  return info
})

const jsonOutputFormat = combine(timestamp(), requestId(), json())
const cliOutputFormat = combine(
  timestamp(),
  requestId(),
  printf((log) => {
    const requestId = log.requestId ? ` [requestId=${log.requestId}]` : ''
    return `[${log.timestamp}] [${log.filename}] [${log.level}]${requestId}: ${log.message}`
  }),
  colorize({ all: true })
)

export function createLogger(filePath: string): Logger {
  return winston
    .createLogger({
      level: config.logger.logLevel || 'info',
      format:
        config.logger.outputFormat === 'json'
          ? jsonOutputFormat
          : cliOutputFormat,
      transports: [new winston.transports.Console()],
    })
    .child({ filename: path.basename(filePath) })
}
