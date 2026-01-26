const { neon } = require("@neondatabase/serverless")
const { drizzle } = require("drizzle-orm/neon-http")
const schema = require("./schema.js")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL not set")
}

const sql = neon(connectionString)
const db = drizzle(sql, { schema })

module.exports = { db }
