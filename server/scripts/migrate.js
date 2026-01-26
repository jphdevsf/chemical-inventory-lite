const fs = require("node:fs")
const path = require("node:path")
const { db } = require("../db/index.js")
const { chemicals, suppliers, inventory } = require("../db/schema.js")
const { eq } = require("drizzle-orm")

async function migrate() {
  const filePath = path.resolve("./temp/data.json")
  if (!fs.existsSync(filePath)) {
    console.log("No JSON data found, skipping migration")
    process.exit(0)
  }

  const rawData = fs.readFileSync(filePath, "utf-8")
  const data = JSON.parse(rawData)

  console.log(`Migrating ${data.length} items...`)

  for (const item of data) {
    // Create chemical if not exists
    const [chem] = await db
      .select()
      .from(chemicals)
      .where(eq(chemicals.chemicalName, item.chemicalName))
    let chemicalId
    if (!chem) {
      const [newChem] = await db
        .insert(chemicals)
        .values({
          chemicalName: item.chemicalName,
          cidNumber: item.cidNumber || null,
          hazardClass: item.hazardClass || null
        })
        .returning()
      chemicalId = newChem.id
    } else {
      chemicalId = chem.id
    }

    // Create supplier if not exists
    let supplierId = null
    if (item.supplier) {
      const [supp] = await db.select().from(suppliers).where(eq(suppliers.name, item.supplier))
      if (!supp) {
        const [newSupp] = await db
          .insert(suppliers)
          .values({
            name: item.supplier
          })
          .returning()
        supplierId = newSupp.id
      } else {
        supplierId = supp.id
      }
    }

    // Create inventory item
    await db.insert(inventory).values({
      id: item.id,
      chemicalId,
      supplierId,
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location || null,
      lotNumber: item.lotNumber || null,
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().split("T")[0]
        : null,
      dateAdded: new Date(item.dateAdded).toISOString(),
      notes: item.notes || null,
      createdBy: "00000000-0000-0000-0000-000000000001" // Default admin
    })
  }

  console.log("Migration complete")
}

migrate()
