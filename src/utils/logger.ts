const winston = require('winston')
// const { LoggingWinston } = require('@google-cloud/logging-winston')

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const level = () => {
  return process.env.NODE_ENV !== 'development' ? 'info' : 'debug'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(colors)
const colorizeWinson =
  process.env.NODE_ENV === 'development'
    ? winston.format.colorize()
    : winston.format.uncolorize()

const winstonFormat = winston.format.printf(
  (info: any) =>
    `${info.timestamp} ${info.level}: ${
      typeof info.message === 'object'
        ? JSON.stringify(info.message)
        : info.message
    }`
)

let format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  colorizeWinson,
  winstonFormat
)
const transports = [new winston.transports.Console()] as any[]

//Development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  )
  transports.push(new winston.transports.File({ filename: 'logs/all.log' }))
} else {
  format = winston.format.combine(
    winston.format((info: any, opts: any) => {
      let level = info.level.toUpperCase()
      if (level === 'VERBOSE') {
        level = 'DEBUG'
      }

      info['severity'] = level
      delete info.level
      return info
    })(),
    winston.format.json()
  )
}

//Production
// if (process.env.NODE_ENV !== 'development') {
// transports.push(new ElasticsearchTransport(levels))
// }

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
})

Logger.on('error', (error: Error) => {
  Logger.error(`Error in logger caught`, error)
})

export default Logger
