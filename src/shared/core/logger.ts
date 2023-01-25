import winston from 'winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'develop'
  const isDevelopment = env === 'develop'
  return isDevelopment ? 'error' : 'error'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const stringify = ({
  timestamp,
  level,
  message,
  meta,
}: winston.Logform.TransformableInfo): string => {
  if (meta && typeof meta === 'object') {
    return `${timestamp || ''} ${level || ''}: ${JSON.stringify(meta)}`
  }

  return `${timestamp || ''} ${level || ''}: ${message}`
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    return stringify(info)
  }),
)

const transports = [new winston.transports.Console()]

export const defaultLogger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export const stdErrorLogger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (stack) {
        // print log trace
        return `${timestamp} ${level}: ${message} - ${stack}`
      }
      return `${timestamp} ${level}: ${message}`
    }),
  ),
  transports,
})

const slackFormatter = (info: winston.Logform.TransformableInfo) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestBody: any = {
    attachments: [
      {
        color: '#333333', // gray
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `${stringify(info)}`,
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
        ],
      },
    ],
  }

  if (info.level === 'error') {
    requestBody.attachments[0].color = '#ee0000' // red
  }

  if (info.level === 'warn') {
    requestBody.attachments[0].color = '#fed000' // yellow
  }

  return requestBody
}
