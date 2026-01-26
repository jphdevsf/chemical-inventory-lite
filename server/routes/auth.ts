import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { userRoleAssignments, userRoles, users } from "../db/schema.js"
import { generateToken, getUserWithRoles, hashPassword, verifyPassword } from "../lib/auth.js"

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" })
  }

  try {
    const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (userRecord.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = userRecord[0]
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const userWithRoles = await getUserWithRoles(user.id)
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userWithRoles.roles.map(r => r.name)
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: userWithRoles.roles.map(r => r.name)
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const register = async (req, res) => {
  const { email, name, password } = req.body

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Email, name, and password required" })
  }

  try {
    const existing = await db.select().from(users).where(eq(users.email, email))
    if (existing.length > 0) {
      return res.status(409).json({ error: "User already exists" })
    }

    const passwordHash = await hashPassword(password)

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash
      })
      .returning()

    // Assign default role 'user_edit'
    const [defaultRole] = await db.select().from(userRoles).where(eq(userRoles.name, "user_edit"))
    if (defaultRole) {
      await db.insert(userRoleAssignments).values({
        userId: newUser.id,
        roleId: defaultRole.id,
        assignedBy: req.user.id // Admin who is registering
      })
    }

    const userWithRoles = await getUserWithRoles(newUser.id)
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roles: userWithRoles.roles.map(r => r.name)
    })

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roles: userWithRoles.roles.map(r => r.name)
      }
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getUsers = async (req, res) => {
  try {
    const allUsers = await db.select().from(users)
    res.json(allUsers)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
