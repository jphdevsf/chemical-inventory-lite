import { neon } from "@neondatabase/serverless"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "./schema.js"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL not set")
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
