const { db } = require("../db/index.js")
const { users, userRoleAssignments, userRoles } = require("../db/schema.js")
const { hashPassword, verifyPassword, generateToken, getUserWithRoles } = require("../lib/auth.js")
const { eq } = require("drizzle-orm")

const login = async (req, res) => {
  const { email, password } = req.body

  const [user] = await db.select().from(users).where(eq(users.email, email))
  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

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
}

const register = async (req, res) => {
  const { email, name, password } = req.body

  const [existing] = await db.select().from(users).where(eq(users.email, email))
  if (existing) return res.status(409).json({ error: "User exists" })

  const passwordHash = await hashPassword(password)

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash
    })
    .returning()

  const [role] = await db.select().from(userRoles).where(eq(userRoles.name, "user_edit"))
  if (role) {
    await db.insert(userRoleAssignments).values({
      userId: newUser.id,
      roleId: role.id
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
}

const getUsers = async (req, res) => {
  const usersList = await db.select().from(users)
  res.json(usersList)
}

module.exports = { login, register, getUsers }
