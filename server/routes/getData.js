import { pool } from "../dbConfig.js"

/**
 * Initial data load
 */
export const getData = async (_req, res) => {
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
}
