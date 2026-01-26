const { relations } = require("drizzle-orm")
const {
  boolean,
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  unique
} = require("drizzle-orm/pg-core")

// Role enum - not needed for table, but for type safety
export const rolePermissions = pgEnum("role_permission", ["view_only", "user_edit", "admin"])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
})

export const userRoleAssignments = pgTable(
  "user_role_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => userRoles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow(),
    assignedBy: uuid("assigned_by").references(() => users.id)
  },
  table => ({
    uniqueUserRole: unique().on(table.userId, table.roleId)
  })
)

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

export const chemicals = pgTable("chemicals", {
  id: uuid("id").defaultRandom().primaryKey(),
  chemicalName: varchar("chemical_name", { length: 255 }).notNull(),
  cidNumber: varchar("cid_number", { length: 50 }),
  casNumber: varchar("cas_number", { length: 50 }),
  molecularFormula: varchar("molecular_formula", { length: 255 }),
  hazardClass: varchar("hazard_class", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

export const inventory = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  chemicalId: uuid("chemical_id")
    .notNull()
    .references(() => chemicals.id, { onDelete: "restrict" }),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }),
  lotNumber: varchar("lot_number", { length: 100 }),
  expirationDate: date("expiration_date"),
  dateAdded: timestamp("date_added").defaultNow(),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  roleAssignments: many(userRoleAssignments)
}))

export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userRoleAssignments.userId],
    references: [users.id]
  }),
  role: one(userRoles, {
    fields: [userRoleAssignments.roleId],
    references: [userRoles.id]
  }),
  assignedByUser: one(users, {
    fields: [userRoleAssignments.assignedBy],
    references: [users.id]
  })
}))

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  inventoryItems: one(inventory, {
    fields: [suppliers.id],
    references: [inventory.supplierId]
  })
}))

export const chemicalsRelations = relations(chemicals, ({ one }) => ({
  inventoryItems: one(inventory, {
    fields: [chemicals.id],
    references: [inventory.chemicalId]
  })
}))

export const inventoryRelations = relations(inventory, ({ one }) => ({
  chemical: one(chemicals, {
    fields: [inventory.chemicalId],
    references: [chemicals.id]
  }),
  supplier: one(suppliers, {
    fields: [inventory.supplierId],
    references: [suppliers.id]
  }),
  createdByUser: one(users, {
    fields: [inventory.createdBy],
    references: [users.id]
  }),
  updatedByUser: one(users, {
    fields: [inventory.updatedBy],
    references: [users.id]
  })
}))

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  assignments: many(userRoleAssignments)
}))
