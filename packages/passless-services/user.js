'use strict'

const db = require('@passless/db')

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

module.exports = {
  createUser,
  listUsers
}
