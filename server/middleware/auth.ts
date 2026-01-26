import { json } from "body-parser"
import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { userRoleAssignments, userRoles, users } from "../db/schema.js"
import { canPerformAction, getUserWithRoles, verifyToken } from "../lib/auth.js"

export const authMiddleware = requiredRoles => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" })
    }

    const user = await getUserWithRoles(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" })
    }

    // Add user to request
    req.user = user

    // Check roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => user.roles.some(r => r.name === role))
      if (!hasRequiredRole) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }
    }

    next()
  }
}
