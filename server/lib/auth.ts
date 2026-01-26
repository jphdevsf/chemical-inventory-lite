import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { Role, User } from "../types/user.js"
import { db } from "./db/index.js"
import { userRoleAssignments, userRoles, users } from "./db/schema.js"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"
const SALT_ROUNDS = 12

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user: {
  id: string
  email: string
  name: string
  roles: string[]
}): string {
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

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Get user with roles
export async function getUserWithRoles(userId: string): Promise<User | null> {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length === 0) return null

  const assignments = await db
    .select({ roleId: userRoleAssignments.roleId })
    .from(userRoleAssignments)
    .innerJoin(userRoles, eq(userRoleAssignments.roleId, userRoles.id))
    .where(eq(userRoleAssignments.userId, userId))

  const roles: Role[] = []
  for (const assignment of assignments) {
    const role = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, assignment.roleId))
      .limit(1)
    if (role[0]) {
      roles.push({
        id: role[0].id,
        name: role[0].name,
        description: role[0].description
      })
    }
  }

  return {
    id: user[0].id,
    email: user[0].email,
    name: user[0].name,
    isActive: user[0].isActive,
    roles
  }
}

// Check if user has required role
export function hasRole(user: any, requiredRole: string): boolean {
  return user?.roles.includes(requiredRole) || false
}

// Check if user can perform action based on role
export function canPerformAction(
  user: any,
  action: "view" | "create" | "update" | "delete" | "admin"
): boolean {
const rolePermissions = {
    view_only: ['view'],
    user_edit: ['view', 'create', 'update'],
    admin: ['view', 'create', 'update', 'delete', 'admin'],
  };

  // Find the highest role permission (admin > user_edit > view_only)
  const userRole = user?.roles?.find(r => r.name === 'admin') ? 'admin' :
    user?.roles?.find(r => r.name === 'user_edit') ? 'user_edit' : 'view_only';

  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];

  // For admin actions, check if has admin role
  if (action === 'admin') {
    return hasRole(user, 'admin');
  }

  return permissions.includes(action);
}

  const userPermissions = rolePermissions[user_edit] || [] // Default to user_edit

  // For admin actions, check if has admin role
  if (action === "admin") {
    return hasRole(user, "admin")
  }

  // For other actions, check the user's highest permission
  const userRole = user?.roles?.[0] || "view_only"
  return (rolePermissions as any)[userRole].includes(action)
}
