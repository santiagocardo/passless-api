'use strict'

const { userServices } = require('@passless/services')

async function userRoutes (fastify, options) {
  fastify.addSchema({
    $id: 'publicUser',
    type: 'object',
    properties: {
      username: { type: 'string' },
      fullName: { type: 'string' }
    }
  })
  fastify.addSchema({
    $id: 'createUser',
    type: 'object',
    properties: {
      password: { type: 'string' }
    },
    required: ['username', 'password']
  })
  fastify.addSchema({
    $id: 'users',
    type: 'array',
    items: { $ref: 'publicUser#' }
  })

  fastify.get(
    '/users',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        response: {
          200: 'users#'
        }
      }
    },
    async (request, reply) => {
      const users = await userServices.listUsers()
      return users.rows
    }
  )

  fastify.post(
    '/users',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        body: 'createUser#',
        response: {
          201: 'publicUser#'
        }
      }
    },
    async (request, reply) => {
      const { username, fullName, password } = request.body
      reply.code(201)
      return userServices.createUser(username, fullName, password)
    }
  )
}

module.exports = userRoutes
