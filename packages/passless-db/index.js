'use strict'

const Redis = require('ioredis')
const db = require('./models')

db.createRedisClient = () => new Redis()

module.exports = db
