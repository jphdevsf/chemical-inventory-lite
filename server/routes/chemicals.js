const { db } = require("../db/index.js")
const { chemicals } = require("../db/schema.js")
const { eq } = require("drizzle-orm")

const getChemicals = async (req, res) => {
  const list = await db.select().from(chemicals)
  res.json(list)
}

const addChemical = async (req, res) => {
  const [chemical] = await db.insert(chemicals).values(req.body).returning()
  res.status(201).json(chemical)
}

module.exports = {
  getChemicals,
  addChemical
}
