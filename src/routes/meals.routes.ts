import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserSessionIdExists } from '../middlewares/check-user-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (req, res) => {
      const sessionId = req.cookies.sessionId

      const user = await knex('users').where('session_id', sessionId).first()

      const meals = await knex('meals').where('user_id', user?.id).select('*')

      return { meals }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (req, res) => {
      const mealsSchema = z.object({
        title: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { title, description, diet } = mealsSchema.parse(req.body)

      const user = await knex('users')
        .where('session_id', req.cookies.sessionId)
        .first()

      await knex('meals').insert({
        id: randomUUID(),
        title,
        description,
        in_diet: diet,
        user_id: user?.id,
      })

      res.status(201).send()
    },
  )
}
