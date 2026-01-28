import { neonConfig } from "@neondatabase/serverless"
import pkg from "pg"
import ws from "ws"

neonConfig.webSocketConstructor = ws

const { Pool: PgPool } = pkg

export const pool = new PgPool({
  connectionString: process.env.DATABASE_URL
})

// // db.js
// import pkg from "pg"

// const { Pool } = pkg

// export const pool = new Pool({
//   user: "postgres",
//   password: "Mstrkrft1",
//   database: "chemical-inventory",
//   host: "localhost",
//   port: 5433
// })
