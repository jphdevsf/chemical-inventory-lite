import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { chemicals } from "../db/schema.js"

export const getChemicals = async (req, res) => {
  try {
    const chemicalsList = await db.select().from(chemicals).orderBy(chemicals.chemicalName)
    res.json(chemicalsList)
  } catch (error) {
    console.error("Get chemicals error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const addChemical = async (req, res) => {
  const { chemicalName, cidNumber, casNumber, molecularFormula, hazardClass, description } =
    req.body

  if (!chemicalName) {
    return res.status(400).json({ error: "Chemical name required" })
  }

  try {
    const existing = await db
      .select()
      .from(chemicals)
      .where(eq(chemicals.chemicalName, chemicalName))
      .limit(1)
    if (existing.length > 0) {
      return res.status(409).json({ error: "Chemical already exists" })
    }

    const [newChemical] = await db
      .insert(chemicals)
      .values({
        chemicalName,
        cidNumber,
        casNumber,
        molecularFormula,
        hazardClass,
        description
      })
      .returning()

    res.status(201).json(newChemical)
  } catch (error) {
    console.error("Add chemical error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
