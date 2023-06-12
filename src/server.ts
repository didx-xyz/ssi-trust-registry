import express from 'express'

export async function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const port = 3000
    const app = express()

    app.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    app.listen(3000, () => {
      console.log(`App is running on port ${port}`)
      resolve(3000)
    })
  })
}
