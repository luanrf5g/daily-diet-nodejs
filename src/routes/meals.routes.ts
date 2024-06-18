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

  app.get(
    '/diet/:id',
    { preHandler: [checkUserSessionIdExists] },
    async (req, res) => {
      const getDietParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getDietParamsSchema.parse(req.params)

      const user = await knex('users')
        .where('session_id', req.cookies.sessionId)
        .first()

      const diet = await knex('meals')
        .where('id', id)
        .andWhere('user_id', user?.id)
        .first()

      res.status(200).send({ diet })
    },
  )

  app.get(
    '/diet',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (req, res) => {
      const user = await knex('users')
        .where('session_id', req.cookies.sessionId)
        .first()

      const meals = await knex('meals').where('user_id', user?.id).select('*')

      const inDietMeals = await knex('meals')
        .where('user_id', user?.id)
        .andWhere('in_diet', 1)
        .select('*')

      const percInDiet = (inDietMeals.length / meals.length) * 100

      res.status(200).send({
        meals: `Refeições: ${meals.length}`,
        inDiet: `Refeições: ${inDietMeals.length}`,
        outDiet: `Refeições: ${meals.length - inDietMeals.length}`,
        Percent: `Percentual: ${percInDiet.toFixed(2)}% dentro da Dieta.`,
      })
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (req, res) => {
      const createMealsBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { title, description, diet } = createMealsBodySchema.parse(req.body)

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

  app.put(
    '/:id',
    { preHandler: [checkUserSessionIdExists] },
    async (req, res) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = updateMealParamsSchema.parse(req.params)

      const updateMealBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        updatedAt: z.string(),
        inDiet: z.boolean(),
      })

      const { title, description, updatedAt, inDiet } =
        updateMealBodySchema.parse(req.body)

      await knex('meals').where('id', id).update({
        title,
        description,
        updated_at: updatedAt,
        in_diet: inDiet,
      })

      res.status(204).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkUserSessionIdExists] },
    async (req, res) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(req.params)

      await knex('meals').where('id', id).del()

      res.status(204).send()
    },
  )
}
