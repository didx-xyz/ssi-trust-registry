import express from 'express'
import { Server } from 'http'

export async function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const port = 3000
    const app = express()

    app.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    const server = app.listen(port, (error?: Error) => {
      if (error) {
        reject(error)
      } else {
        console.log(`Server is running on port ${port}`)
        resolve(server)
      }
    })
  })
}
