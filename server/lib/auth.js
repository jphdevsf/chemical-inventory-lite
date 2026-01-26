const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { db } = require("./db/index.js")
const { users, userRoles, userRoleAssignments } = require("./schema.js")
const { eq } = require("drizzle-orm")

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"
const SALT_ROUNDS = 12

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  )
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

async function getUserWithRoles(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) return null

  const assignments = await db
    .select({ roleId: userRoleAssignments.roleId })
    .from(userRoleAssignments)
    .innerJoin(userRoles, eq(userRoleAssignments.roleId, userRoles.id))
    .where(eq(userRoleAssignments.userId, userId))

  const roles = []
  for (const assignment of assignments) {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.id, assignment.roleId))
    if (role) {
      roles.push(role)
    }
  }

  return {
    ...user,
    roles
  }
}

function hasRole(user, requiredRole) {
  return user.roles.some(r => r.name === requiredRole)
}

function canPerformAction(user, action) {
  const rolePermissions = {
    view_only: ["view"],
    user_edit: ["view", "create", "update"],
    admin: ["view", "create", "update", "delete", "admin"]
  }
  const userRole = user.roles.find(r => r.name === "admin")
    ? "admin"
    : user.roles.find(r => r.name === "user_edit")
      ? "user_edit"
      : "view_only"
  const permissions = rolePermissions[userRole] || []
  if (action === "admin") return hasRole(user, "admin")
  return permissions.includes(action)
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserWithRoles,
  hasRole,
  canPerformAction
}
