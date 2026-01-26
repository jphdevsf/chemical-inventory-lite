const { db } = require("../db/index.js")
const { suppliers } = require("../db/schema.js")
const { eq } = require("drizzle-orm")

const getSuppliers = async (req, res) => {
  const list = await db.select().from(suppliers)
  res.json(list)
}

const addSupplier = async (req, res) => {
  const [supplier] = await db.insert(suppliers).values(req.body).returning()
  res.status(201).json(supplier)
}

const updateSupplier = async (req, res) => {
  const { id } = req.params
  const [supplier] = await db
    .update(suppliers)
    .set(req.body)
    .where(eq(suppliers.id, id))
    .returning()
  if (!supplier) return res.status(404).json({ error: "Not found" })
  res.json(supplier)
}

module.exports = {
  getSuppliers,
  addSupplier,
  updateSupplier
}
