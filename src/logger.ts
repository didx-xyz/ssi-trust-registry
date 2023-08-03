import type { Logger } from 'winston'
import winston from 'winston'
import httpContext from 'express-http-context'
import path from 'node:path'
import { config } from './config'

const { combine, timestamp, json, colorize, printf } = winston.format

const requestId = winston.format((info) => {
  info.requestId = httpContext.get('requestId')
  return info
})

const metadata = winston.format((info) => {
  const additionalArgs = info[Symbol.for('splat')]
  if (additionalArgs) {
    if (additionalArgs.length === 1) {
      info.metadata = additionalArgs[0]
    } else {
      info.metadata = additionalArgs
    }
  }
  return info
})

const jsonOutputFormat = combine(timestamp(), requestId(), metadata(), json())
const cliOutputFormat = combine(
  timestamp(),
  requestId(),
  metadata(),
  printf((log) => {
    const requestId = log.requestId ? ` [requestId=${log.requestId}]` : ''
    const metadata = log.metadata
      ? `\n${JSON.stringify(log.metadata, null, 2)}`
      : ''
    return `[${log.timestamp}] [${log.filename}] [${log.level}]${requestId}: ${log.message} ${metadata}`
  }),
  colorize({ all: true }),
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
