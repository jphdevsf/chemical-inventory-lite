const { verifyToken, getUserWithRoles, hasRole } = require("../lib/auth.js")

const authMiddleware = requiredRoles => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "")
    if (!token) return res.status(401).json({ error: "No token provided" })

    const decoded = verifyToken(token)
    if (!decoded) return res.status(401).json({ error: "Invalid token" })

    const user = await getUserWithRoles(decoded.userId)
    if (!user || !user.isActive) return res.status(401).json({ error: "User not active" })

    if (requiredRoles && requiredRoles.length > 0) {
      const hasPermission = requiredRoles.some(role => hasRole(user, role))
      if (!hasPermission) return res.status(403).json({ error: "Forbidden" })
    }

    req.user = user
    next()
  }
}

module.exports = { authMiddleware }
