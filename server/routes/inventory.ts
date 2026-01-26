import { and, eq, ilike } from "drizzle-orm"
import { db } from "../db/index.js"
import { chemicals, inventory, suppliers } from "../db/schema.js"

export const getInventory = async (req, res) => {
  try {
    const { search, hazardClass, location } = req.query

    let whereConditions = eq(inventory.createdBy, req.user.id) // Only user's inventory by default

    if (search) {
      whereConditions = and(whereConditions, ilike(chemicals.chemicalName, `%${search}%`))
    }

    if (hazardClass) {
      whereConditions = and(whereConditions, ilike(chemicals.hazardClass, `%${hazardClass}%`))
    }

    if (location) {
      whereConditions = and(whereConditions, ilike(inventory.location, `%${location}%`))
    }

    const results = await db
      .select({
        id: inventory.id,
        quantity: inventory.quantity,
        unit: inventory.unit,
        location: inventory.location,
        lotNumber: inventory.lotNumber,
        expirationDate: inventory.expirationDate,
        dateAdded: inventory.dateAdded,
        notes: inventory.notes,
        chemicalName: chemicals.chemicalName,
        cidNumber: chemicals.cidNumber,
        hazardClass: chemicals.hazardClass,
        supplierName: suppliers.name
      })
      .from(inventory)
      .innerJoin(chemicals, eq(inventory.chemicalId, chemicals.id))
      .leftJoin(suppliers, eq(inventory.supplierId, suppliers.id))
      .where(whereConditions)
      .orderBy(inventory.createdAt)

    res.json(results)
  } catch (error) {
    console.error("Get inventory error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const addInventory = async (req, res) => {
  const {
    chemicalName,
    cidNumber,
    supplierName,
    quantity,
    unit,
    location,
    lotNumber,
    expirationDate,
    notes
  } = req.body

  if (!chemicalName || !quantity || !unit) {
    return res.status(400).json({ error: "Chemical name, quantity, and unit required" })
  }

  try {
    // Check if chemical exists, if not create it
    const chemicalRecord = await db
      .select()
      .from(chemicals)
      .where(eq(chemicals.cidNumber, cidNumber || ""))
      .limit(1)
    let chemicalId
    if (chemicalRecord.length === 0 && chemicalName) {
      const [newChemical] = await db
        .insert(chemicals)
        .values({
          chemicalName,
          cidNumber: cidNumber || null
        })
        .returning()
      chemicalId = newChemical.id
    } else {
      chemicalId = chemicalRecord[0].id
    }

    // Check if supplier exists, if not create it
    let supplierId
    if (supplierName) {
      const supplierRecord = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.name, supplierName))
        .limit(1)
      if (supplierRecord.length === 0) {
        const [newSupplier] = await db
          .insert(suppliers)
          .values({
            name: supplierName
          })
          .returning()
        supplierId = newSupplier.id
      } else {
        supplierId = supplierRecord[0].id
      }
    }

    const [newInventory] = await db
      .insert(inventory)
      .values({
        chemicalId,
        supplierId: supplierId || null,
        quantity,
        unit,
        location,
        lotNumber,
        expirationDate,
        notes,
        createdBy: req.user.id,
        updatedBy: req.user.id
      })
      .returning()

    // Return the full inventory item
    const fullItem = await db
      .select({
        id: inventory.id,
        quantity: inventory.quantity,
        unit: inventory.unit,
        location: inventory.location,
        lotNumber: inventory.lotNumber,
        expirationDate: inventory.expirationDate,
        dateAdded: inventory.dateAdded,
        notes: inventory.notes,
        chemicalName: chemicals.chemicalName,
        cidNumber: chemicals.cidNumber,
        hazardClass: chemicals.hazardClass,
        supplierName: suppliers.name
      })
      .from(inventory)
      .innerJoin(chemicals, eq(inventory.chemicalId, chemicals.id))
      .leftJoin(suppliers, eq(inventory.supplierId, suppliers.id))
      .where(eq(inventory.id, newInventory.id))
      .limit(1)

    res.status(201).json(fullItem[0])
  } catch (error) {
    console.error("Add inventory error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateInventory = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!updates) {
    return res.status(400).json({ error: "Update data required" })
  }

  try {
    const existing = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1)
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    const item = existing[0]
    if (item.createdBy !== req.user.id && !req.user.roles.some(r => r.name === "admin")) {
      return res.status(403).json({ error: "Cannot update other user's inventory" })
    }

    await db
      .update(inventory)
      .set({
        ...updates,
        updatedBy: req.user.id,
        updatedAt: new Date()
      })
      .where(eq(inventory.id, id))

    // Return updated full item
    const fullItem = await db
      .select({
        id: inventory.id,
        quantity: inventory.quantity,
        unit: inventory.unit,
        location: inventory.location,
        lotNumber: inventory.lotNumber,
        expirationDate: inventory.expirationDate,
        dateAdded: inventory.dateAdded,
        notes: inventory.notes,
        chemicalName: chemicals.chemicalName,
        cidNumber: chemicals.cidNumber,
        hazardClass: chemicals.hazardClass,
        supplierName: suppliers.name
      })
      .from(inventory)
      .innerJoin(chemicals, eq(inventory.chemicalId, chemicals.id))
      .leftJoin(suppliers, eq(inventory.supplierId, suppliers.id))
      .where(eq(inventory.id, id))
      .limit(1)

    res.json(fullItem[0])
  } catch (error) {
    console.error("Update inventory error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteInventory = async (req, res) => {
  const { id } = req.params

  try {
    const existing = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1)
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    const item = existing[0]
    if (item.createdBy !== req.user.id && !req.user.roles.some(r => r.name === "admin")) {
      return res.status(403).json({ error: "Cannot delete other user's inventory" })
    }

    await db.delete(inventory).where(eq(inventory.id, id))

    res.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Delete inventory error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
