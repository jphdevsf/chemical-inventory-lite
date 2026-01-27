import cors from "cors"
import express from "express"
import pkg from "pg"

const { Pool } = pkg
const app = express()
const port = 3001

const pool = new Pool({
  user: "postgres",
  password: "Mstrkrft1",
  database: "chemical-inventory",
  host: "localhost",
  port: 5433
})

app.use(express.json())

// Add CORS headers
app.use(cors())
// app.use("/data", (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*")
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//   next()
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// READ
app.get("/data", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT inventory.id, quantity, unit, location, lot_number, expiration_date, date_added, notes, chemical_name, cid_number, hazard_class, suppliers.name
      FROM inventory
      INNER JOIN chemicals ON inventory.chemical_id = chemicals.id
      INNER JOIN suppliers ON inventory.supplier_id = suppliers.id
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Database query failed" })
  }
})

// app.get("/data", (req, res) => {
//   try {
//     const json = fs.readFileSync(filePath, "utf-8")
//     res.json(JSON.parse(json))
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "Failed to read file" })
//   }
// })

// WRITE
app.post("/data", async (req, res) => {
  try {
    const items = req.body // this is your array of ChemicalInventoryItem

    // Insert each item into Postgres
    const results = []
    for (const item of items) {
      const result = await pool.query(
        `INSERT INTO inventory 
          (expiration_date, id, location, lot_number, notes, quantity, unit)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          item.expiration_date,
          item.id,
          item.location,
          item.lot_number,
          item.notes,
          item.quantity,
          item.unit
        ]
      )

      results.push(result.rows[0])
    }

    res.json({ success: true, data: results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to save inventory" })
  }
})

// app.post("/data", (req, res) => {
// try {
//   fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
//   res.json({ ok: true })
// } catch (err) {
//   console.error(err)
//   res.status(500).json({ error: "Failed to write file" })
// }
// })
