'use strict'

const { secretServices } = require('@passless/services')

async function secretRoutes (fastify, options) {
  fastify.addSchema({
    $id: 'publicSecret',
    type: 'object',
    properties: {
      username: { type: 'string' },
      name: { type: 'string' }
    }
  })
  fastify.addSchema({
    $id: 'createOrUpdateSecret',
    type: 'object',
    properties: {
      name: { type: 'string' },
      value: { type: 'string' }
    },
    required: ['name', 'value']
  })
  fastify.addSchema({
    $id: 'secret',
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  })
  fastify.addSchema({
    $id: 'getSecrets',
    type: 'array',
    items: { $ref: 'publicSecret#' }
  })
  fastify.addSchema({
    $id: 'getSecret',
    type: 'object',
    properties: {
      username: { type: 'string' },
      name: { type: 'string' },
      value: { type: 'string' }
    }
  })

  fastify.get(
    '/secrets',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        response: {
          200: 'getSecrets#'
        }
      }
    },
    async (request, reply) => {
      const { user: username } = request.user
      const secrets = await secretServices.listSecrets(username)
      return secrets.rows
    }
  )

  fastify.post(
    '/secrets',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        body: 'createOrUpdateSecret#',
        response: {
          201: 'publicSecret#'
        }
      }
    },
    async (request, reply) => {
      const { user: username } = request.user
      const { name, value } = request.body
      reply.code(201)
      return secretServices.createSecret(username, name, value)
    }
  )

  fastify.delete(
    '/secrets/:name',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        params: 'secret#'
      }
    },
    async (request, reply) => {
      fastify.log.info(request.user)
      const { user: username } = request.user
      await secretServices.deleteSecret(username, request.params.name)
      reply.send({ status: 'deleted' })
    }
  )

  fastify.get(
    '/secrets/:name',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        params: 'secret#',
        response: {
          200: 'getSecret#'
        }
      }
    },
    async (request, reply) => {
      const { user: username } = request.user
      return secretServices.getSecret(username, request.params.name)
    }
  )

  fastify.put(
    '/secrets',
    {
      preValidation: fastify.auth([fastify.validateJWT]),
      schema: {
        body: 'createOrUpdateSecret#'
      }
    },
    async (request, reply) => {
      const { user: username } = request.user
      const { name, value } = request.body
      await secretServices.updateSecret(username, name, value)
      reply.send({ status: 'updated' })
    }
  )
}

module.exports = secretRoutes
