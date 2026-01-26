const { db } = require("../db/index.js")
const { inventory, chemicals, suppliers } = require("../db/schema.js")
const { eq, and, ilike } = require("drizzle-orm")
const { hasRole } = require("../lib/auth.js")

const getInventory = async (req, res) => {
  const where = eq(inventory.createdBy, req.user.id) // User-specific by default

  const { search, location } = req.query

  let conditions = where
  if (search) {
    conditions = and(conditions, ilike(chemicals.chemicalName, `%${search}%`))
  }
  if (location) {
    conditions = and(conditions, ilike(inventory.location, `%${location}%`))
  }

  const results = await db
    .select({
      id: inventory.id,
      chemicalName: chemicals.chemicalName,
      cidNumber: chemicals.cidNumber,
      quantity: inventory.quantity,
      unit: inventory.unit,
      location: inventory.location,
      hazardClass: chemicals.hazardClass,
      supplier: suppliers.name,
      lotNumber: inventory.lotNumber,
      expirationDate: inventory.expirationDate,
      dateAdded: inventory.dateAdded,
      notes: inventory.notes
    })
    .from(inventory)
    .innerJoin(chemicals, eq(inventory.chemicalId, chemicals.id))
    .leftJoin(suppliers, eq(inventory.supplierId, suppliers.id))
    .where(conditions)

  res.json(results)
}

const addInventory = async (req, res) => {
  const {
    chemicalName,
    cidNumber,
    supplier,
    quantity,
    unit,
    location,
    lotNumber,
    expirationDate,
    notes
  } = req.body

  // Create or get chemical
  let chemical
  if (cidNumber) {
    ;[chemical] = await db.select().from(chemicals).where(eq(chemicals.cidNumber, cidNumber))
  } else {
    ;[chemical] = await db.select().from(chemicals).where(eq(chemicals.chemicalName, chemicalName))
  }
  if (!chemical) {
    ;[chemical] = await db.insert(chemicals).values({ chemicalName, cidNumber }).returning()
  }

  // Create or get supplier
  let supplierId
  if (supplier) {
    const [supp] = await db.select().from(suppliers).where(eq(suppliers.name, supplier))
    if (supp) {
      supplierId = supp.id
    } else {
      const [newSupp] = await db.insert(suppliers).values({ name: supplier }).returning()
      supplierId = newSupp.id
    }
  }

  const [newItem] = await db
    .insert(inventory)
    .values({
      chemicalId: chemical.id,
      supplierId,
      quantity: Number(quantity),
      unit,
      location,
      lotNumber,
      expirationDate,
      notes,
      createdBy: req.user.id
    })
    .returning()

  res.status(201).json(newItem)
}

const updateInventory = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  const [existing] = await db.select().from(inventory).where(eq(inventory.id, id))
  if (!existing) return res.status(404).json({ error: "Not found" })

  if (existing.createdBy !== req.user.id && !hasRole(req.user, "admin")) {
    return res.status(403).json({ error: "Forbidden" })
  }

  const [updated] = await db
    .update(inventory)
    .set({
      ...updates,
      updatedBy: req.user.id
    })
    .where(eq(inventory.id, id))
    .returning()

  res.json(updated)
}

const deleteInventory = async (req, res) => {
  const { id } = req.params

  const [existing] = await db.select().from(inventory).where(eq(inventory.id, id))
  if (!existing) return res.status(404).json({ error: "Not found" })

  if (existing.createdBy !== req.user.id && !hasRole(req.user, "admin")) {
    return res.status(403).json({ error: "Forbidden" })
  }

  await db.delete(inventory).where(eq(inventory.id, id))

  res.json({ message: "Deleted" })
}

module.exports = {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory
}
