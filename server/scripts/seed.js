const { db } = require("../db/index.js")
const { userRoles, userRoleAssignments, users } = require("../db/schema.js")
const { hashPassword } = require("../lib/auth.js")
const { eq } = require("drizzle-orm")

async function seedRoles() {
  const [count] = await db.select({ count: count() }).from(userRoles)
  if (count > 0) return
  await db.insert(userRoles).values([
    { name: "view_only", description: "View only access" },
    { name: "user_edit", description: "Edit access (no delete)" },
    { name: "admin", description: "Full access" }
  ])
  console.log("Roles seeded")
}

async function createAdmin() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@chemicalinventory.com"))
  if (existing) return

  const passwordHash = await hashPassword("admin123")

  const [user] = await db
    .insert(users)
    .values({
      email: "admin@chemicalinventory.com",
      name: "Admin User",
      passwordHash
    })
    .returning()

  const [role] = await db.select().from(userRoles).where(eq(userRoles.name, "admin"))
  if (role) {
    await db.insert(userRoleAssignments).values({
      userId: user.id,
      roleId: role.id
    })
  }

  console.log("Admin created: admin@chemicalinventory.com / admin123")
}

seedRoles()
createAdmin()
console.log("Seeding complete")
