'use strict'

const { authenticate } = require('@passless/auth')
const fp = require('fastify-plugin')

async function authentication (fastify, options) {
  fastify
    .register(require('fastify-jwt'), {
      secret: 'supersecret'
    })
    .register(require('fastify-auth'))
    .decorate('validateJWT', async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.send(err)
      }
    })
    .decorate('validateUser', async (request, reply) => {
      const { username, password } = request.body
      const isAuthenticated = await authenticate(username, password)
      if (isAuthenticated) {
        request.user = username
      } else {
        reply.code(401).send(new Error('Forbidden'))
      }
    })
    .after(() => {
      fastify.post(
        '/auth',
        { preValidation: fastify.auth([fastify.validateUser]) },
        async (request, reply) => {
          const user = request.user
          const token = fastify.jwt.sign({ user })
          return token
        }
      )
    })
}

module.exports = fp(authentication)
