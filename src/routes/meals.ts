import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', (req, res) => {
    const headers = req.headers
    const body = req.body

    console.log({
      headers,
      body,
    })

    res.send()
  })

  app.get('/', (req, res) => {
    const id = '213r4dsa'

    const { userid } = req.headers

    if (id === userid) {
      console.log('OK!')
    } else {
      console.log('FAILED!')
    }

    res.send()
  })
}
