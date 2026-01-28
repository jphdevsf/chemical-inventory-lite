// db.js
import pkg from "pg"

const { Pool } = pkg

export const pool = new Pool({
  user: "postgres",
  password: "Mstrkrft1",
  database: "chemical-inventory",
  host: "localhost",
  port: 5433
})
