import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (req, res) => {
    const users = await knex('users').select('*')

    res.send({ users }).status(200)
  })

  app.post('/', async (req, res) => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = userSchema.parse(req.body)

    const sessionId = randomUUID()

    res.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })
  })
}
