import Logger from '@/utils/logger'
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import 'reflect-metadata'
require('dotenv').config()

class App {
  public app: express.Application
  public port: number

  constructor(port: number) {
    // This is where the methods get called
    this.app = express()
    this.port = port
  }

  public initialize() {
    return new Promise(async (resolve, reject) => {
      try {
        this.initializeMiddleware()
        this.initializeRouter()
        this.initializeTemplateEngine()
        this.initializeExceptionHandler()

        this.app.get('/', (req: Request, res: Response) => {
          res.send({
            message: 'Server is running',
            date: new Date(),
            version: '1.0'
          })
        })

        resolve(this)
      } catch (err) {
        reject(err)
      }
    })
  }

  private initializeMiddleware() {
    this.app.use(
      cors({
        origin: true,

        allowedHeaders: [
          '*',
          'Authorization',
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Methods',
          'content-type'
        ],
        optionsSuccessStatus: 200
        // credentials: true
      })
    )
    morganBody(this.app, {
      stream: {
        write: (message: any) => Logger.http({ message: message }) as any
      },
      prettify: false,
      includeNewLine: false
    })
    this.app.use(morgan('dev'))
    // this.app.use(bodyParser.json)
    this.app.use(
      bodyParser.urlencoded({
        limit: '1gb',
        extended: true,
        parameterLimit: 50000
      })
    )
    this.app.use(bodyParser.json({ limit: '1gb' }))
  }

  private initializeRouter() {
    // TODO: write your route here
    this.app.get('/', (req:Request, res:Response, next:NextFunction)=>{})
    this.app.get('/version', (req:Request, res:Response, next:NextFunction)=>{
      res.send({
        message: 'Server is running',
        date: new Date(),
        version: '1.0'
      })

    })
  }

  private initializeTemplateEngine() {
    this.app.set('view engine', 'pug')
    this.app.set('views', path.join(__dirname, 'views'))
  }

  public listen() {
    const server = this.app.listen(this.port, () => {
      Logger.info(`App listening on port ${this.port}`)
      //
    })
    server.setTimeout(1000 * 60 * 60)

    for (let signal of ['SIGTERM', 'SIGINT'])
      process.on(signal, () => {
        console.log(`${signal} signal received.`)
        console.log('Closing http server.')

        server.close(async (err) => {
          // await this.close()
          console.log('Http server closed.')
          // @ts-ignore
          process.exit(err ? 1 : 0, err ? err : null)
        })
      })
  }



  private initializeExceptionHandler() {
    this.app.use(
      async (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        try {
          //Logger
          console.log(err)
          return res.status(500).send(err)
        } catch (e) {
          console.error('Error on error Handler', e)
          next(e)
        }
      }
    )
  }
  // private async close() {
  //   await this.closeDatabase()
  // }

  // private async closeDatabase() {
  //   await PostgresDataSource.destroy().then(async () => {
  //     Logger.info('Postgres database connection closed.')
  //   })
  //   await MongoDataSource.destroy().then(async () => {
  //     Logger.info('Mongo database connection closed.')
  //   })
  // }
}

export default App
