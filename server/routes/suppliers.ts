import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { suppliers } from "../db/schema.js"

export const getSuppliers = async (req, res) => {
  try {
    const suppliersList = await db.select().from(suppliers).orderBy(suppliers.name)
    res.json(suppliersList)
  } catch (error) {
    console.error("Get suppliers error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const addSupplier = async (req, res) => {
  const { name, contactEmail, contactPhone, address, website } = req.body

  if (!name) {
    return res.status(400).json({ error: "Supplier name required" })
  }

  try {
    const existing = await db.select().from(suppliers).where(eq(suppliers.name, name)).limit(1)
    if (existing.length > 0) {
      return res.status(409).json({ error: "Supplier already exists" })
    }

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        name,
        contactEmail,
        contactPhone,
        address,
        website
      })
      .returning()

    res.status(201).json(newSupplier)
  } catch (error) {
    console.error("Add supplier error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateSupplier = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!updates) {
    return res.status(400).json({ error: "Update data required" })
  }

  try {
    const existing = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
    if (existing.length === 0) {
      return res.status(404).json({ error: "Supplier not found" })
    }

    await db.update(suppliers).set(updates).where(eq(suppliers.id, id))

    const updated = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
    res.json(updated[0])
  } catch (error) {
    console.error("Update supplier error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
