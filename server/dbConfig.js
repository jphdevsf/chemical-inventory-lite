import { neonConfig } from "@neondatabase/serverless"
import dotenv from "dotenv"
import pkg from "pg"
import ws from "ws"

dotenv.config()

neonConfig.webSocketConstructor = ws

const { Pool: PgPool } = pkg

export const pool = new PgPool({
  connectionString: process.env.DATABASE_URL
})
