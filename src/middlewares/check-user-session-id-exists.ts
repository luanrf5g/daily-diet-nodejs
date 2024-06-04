import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkUserSessionIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return res.status(401).send({
      error: 'unauthorized.',
    })
  }

  const userSessionId = await knex('users')
    .where('session_id', sessionId)
    .first()

  if (userSessionId === undefined) {
    return res.status(401).send({
      error: 'user unauthorized',
    })
  }
}
