'use strict'

const { User, createRedisClient } = require('@passless/db')
const { comparePassword, generateKey } = require('@passless/crypto')

async function isAuthenticated (username) {
  const isAuth = await getSecretKey(username)
  return isAuth != null
}

async function getSecretKey (username) {
  const redisClient = createRedisClient()
  const secretKey = await redisClient.get(username)
  redisClient.disconnect()
  return secretKey
}

async function authenticate (username, password) {
  const user = await User.findOne({ where: { username } })
  if (!user) return false

  const isValid = await comparePassword(password, user.password)
  if (isValid) {
    const redisClient = createRedisClient()
    await redisClient.set(username, generateKey(password), 'EX', 2 * 60)
    redisClient.disconnect()
  }

  return isValid && user
}

module.exports = {
  isAuthenticated,
  getSecretKey,
  authenticate
}
