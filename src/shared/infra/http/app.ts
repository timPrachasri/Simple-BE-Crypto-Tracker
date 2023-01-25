import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

const origin = {
  origin: '*',
}

const app = express()

app.use(cors(origin))
app.use(compression())
app.use(helmet())
app.use(morgan('combined'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
// parse application/json
app.use(bodyParser.json({ limit: '50mb' }))

app.use((req, res, next) => {
  res.append('Cross-Origin-Resource-Policy', ['cross-origin'])
  next()
})

const port = process.env.PORT || 3002

app.listen(port, () => {
  console.log(`[App]: Listening on port ${port}`)
})
