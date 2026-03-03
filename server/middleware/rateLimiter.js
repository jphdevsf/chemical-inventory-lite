import crypto from "node:crypto"
import { pool } from "../dbConfig.js"

const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 50
const RATE_LIMIT_CLEANUP_HOURS = 1

function hashIP(ip) {
  const salt = process.env.RATE_LIMIT_SALT
  if (!salt) {
    throw new Error("RATE_LIMIT_SALT environment variable is required")
  }
  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex")
}

export const dbRateLimiter = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress
    if (!ip) {
      return next()
    }

    const hashedIP = hashIP(ip)

    const result = await pool.query(
      `
      INSERT INTO rate_limits (ip, request_count, window_start)
      VALUES ($1, 1, NOW())
      ON CONFLICT (ip) 
      DO UPDATE SET 
        request_count = CASE 
          WHEN rate_limits.window_start < NOW() - INTERVAL '${RATE_LIMIT_WINDOW_MINUTES} minutes' 
          THEN 1 
          ELSE rate_limits.request_count + 1 
        END,
        window_start = CASE 
          WHEN rate_limits.window_start < NOW() - INTERVAL '${RATE_LIMIT_WINDOW_MINUTES} minutes' 
          THEN NOW() 
          ELSE rate_limits.window_start 
        END
      RETURNING request_count
    `,
      [hashedIP]
    )

    const { request_count } = result.rows[0]

    if (request_count > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({
        error: `Rate Limit Error: You've exceeded ${RATE_LIMIT_MAX_REQUESTS} API requests in ${RATE_LIMIT_WINDOW_MINUTES} minute(s). Try again later.`
      })
    }

    next()
  } catch (err) {
    console.error("Rate limiter error:", err)
    next()
  }
}

export const cleanupOldRateLimits = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '${RATE_LIMIT_CLEANUP_HOURS} hour'`
    )
    console.log(`Cleaned up ${result.rowCount} old rate limit entries`)
  } catch (err) {
    console.error("Rate limit cleanup error:", err)
  }
}
