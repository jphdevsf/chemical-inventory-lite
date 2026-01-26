import { eq } from "drizzle-orm"
import { db } from "./db/index.js"
import { rolePermissions, userRoleAssignments, userRoles, users } from "./db/schema.js"
import { hashPassword } from "./lib/auth.js"

// Seed default roles
async function seedRoles() {
  const existingRoles = await db.select().from(userRoles)
  if (existingRoles.length > 0) {
    console.log("Roles already exist, skipping...")
    return
  }

  const roles = [
    {
      name: "view_only",
      description: "Can view inventory only"
    },
    {
      name: "user_edit",
      description: "Can view, add, and edit inventory (no delete)"
    },
    {
      name: "admin",
      description: "Full access including delete and user management"
    }
  ]

  for (const roleData of roles) {
    await db.insert(userRoles).values({
      name: roleData.name,
      description: roleData.description
    })
  }

  console.log("Default roles seeded successfully")
}

// Create default admin user
async function createAdminUser() {
  const defaultAdmin = {
    email: "admin@chemicalinventory.com",
    name: "Admin User",
    password: "admin123" // Change this in production!
  }

  const existing = await db.select().from(users).where(eq(users.email, defaultAdmin.email))
  if (existing.length > 0) {
    console.log("Admin user already exists, skipping...")
    return
  }

  const passwordHash = await hashPassword(defaultAdmin.password)

  const [user] = await db
    .insert(users)
    .values({
      email: defaultAdmin.email,
      name: defaultAdmin.name,
      passwordHash
    })
    .returning()

  // Assign admin role to the user
  const [adminRole] = await db.select().from(userRoles).where(eq(userRoles.name, "admin"))

  if (adminRole) {
    await db.insert(userRoleAssignments).values({
      userId: user.id,
      roleId: adminRole.id,
      assignedBy: user.id
    })
  }

  console.log(`Default admin user created: ${defaultAdmin.email} / ${defaultAdmin.password}`)
  console.log("Please change the default password immediately!")
}

// Main seed function
async function seedDatabase() {
  try {
    await seedRoles()
    await createAdminUser()
    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export { seedDatabase }
