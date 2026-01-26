import fs from "node:fs"
import path from "node:path"
import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { chemicals, inventory, suppliers } from "../db/schema.js"

const migrateData = async () => {
  const filePath = path.resolve("./temp/data.json")
  if (!fs.existsSync(filePath)) {
    console.log("No data.json found, skipping migration")
    return
  }

  console.log("Starting data migration from JSON...")
  const rawData = fs.readFileSync(filePath, "utf-8")
  const data = JSON.parse(rawData)

  // Extract unique chemicals
  const uniqueChemicals = data.reduce((acc, item) => {
    if (!acc[item.chemicalName] && item.chemicalName) {
      acc[item.chemicalName] = {
        chemicalName: item.chemicalName,
        cidNumber: item.cidNumber || null,
        casNumber: null,
        molecularFormula: null,
        hazardClass: item.hazardClass || null,
        description: null
      }
    }
    return acc
  }, {})

  const chemicalsToInsert = Object.values(uniqueChemicals)
  for (const chem of chemicalsToInsert) {
    await db.insert(chemicals).values(chem).onConflictDoNothing() // Avoid duplicates
  }
  console.log(`Inserted ${chemicalsToInsert.length} chemicals`)

  // Extract unique suppliers
  const uniqueSuppliers = data.reduce((acc, item) => {
    if (!acc[item.supplier] && item.supplier) {
      acc[item.supplier] = {
        name: item.supplier,
        contactEmail: null,
        contactPhone: null,
        address: null,
        website: null
      }
    }
    return acc
  }, {})

  const suppliersToInsert = Object.values(uniqueSuppliers)
  for (const supp of suppliersToInsert) {
    await db.insert(suppliers).values(supp).onConflictDoNothing()
  }
  console.log(`Inserted ${suppliersToInsert.length} suppliers`)

  // Migrate inventory items
  for (const item of data) {
    if (!item.id || !item.chemicalName) continue

    // Find chemical ID
    const chemicalRecords = await db
      .select()
      .from(chemicals)
      .where(eq(chemicals.chemicalName, item.chemicalName))
      .limit(1)
    if (chemicalRecords.length === 0) continue

    const chemicalId = chemicalRecords[0].id

    // Find supplier ID
    let supplierId = null
    if (item.supplier) {
      const supplierRecords = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.name, item.supplier))
        .limit(1)
      if (supplierRecords.length > 0) {
        supplierId = supplierRecords[0].id
      }
    }

    await db.insert(inventory).values({
      id: item.id,
      chemicalId,
      supplierId,
      quantity: parseFloat(item.quantity.toString()),
      unit: item.unit,
      location: item.location,
      lotNumber: item.lotNumber,
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().split("T")[0]
        : null,
      dateAdded: new Date(item.dateAdded).toISOString(),
      notes: item.notes,
      createdBy: "00000000-0000-0000-0000-000000000001", // Default first user or admin
      updatedBy: null
    })
  }

  console.log("Data migration completed successfully!")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
}

export { migrateData }
