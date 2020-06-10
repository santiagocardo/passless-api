'use strict'

const db = require('@passless/db')
const { hashPassword, comparePassword, generateKey } = require('@passless/crypto')
const { updateAllSecrets } = require('./secret')

async function createUser (username, fullname, password) {
  return db.User.create({
    username,
    fullName: fullname,
    password
  })
}

async function listUsers () {
  return db.User.findAndCountAll()
}

async function changePassword (username, oldPassword, newPassword) {
  const user = await db.User.findOne({ where: { username } })
  const isValidPassword = await comparePassword(oldPassword, user.password)

  if (!isValidPassword) {
    throw new Error('Invalid password')
  }

  user.password = await hashPassword(newPassword)
  await user.save()
  await updateAllSecrets(
    username,
    generateKey(oldPassword),
    generateKey(newPassword)
  )

  const oldKey = generateKey(oldPassword)
  const newKey = generateKey(newPassword)

  const redis = db.createRedisClient()
  redis.publish('update-password', JSON.stringify({
    username,
    oldKey,
    newKey
  }))
}

module.exports = {
  createUser,
  listUsers,
  changePassword
}
