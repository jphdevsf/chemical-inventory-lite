import { pool } from "../dbConfig.js"

/**
 * Update existing
 */
export const updateData = async (req, res) => {
  try {
    const {
      id,
      chemical_name,
      cid_number,
      hazard_class,
      quantity,
      unit,
      location,
      lot_number,
      expiration_date,
      notes,
      name: supplier_name
    } = req.body

    const current = await pool.query(
      `SELECT chemical_id, supplier_id FROM inventory WHERE id = $1`,
      [id]
    )

    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    const { chemical_id } = current.rows[0]

    await pool.query(
      `UPDATE chemicals SET chemical_name = $1, cid_number = $2, hazard_class = $3 WHERE id = $4`,
      [chemical_name, cid_number, hazard_class, chemical_id]
    )

    let supplier_id
    const existingSupplier = await pool.query(`SELECT id FROM suppliers WHERE name = $1`, [
      supplier_name
    ])

    if (existingSupplier.rows.length > 0) {
      supplier_id = existingSupplier.rows[0].id
    } else {
      const newSupplier = await pool.query(
        `INSERT INTO suppliers (name) VALUES ($1) RETURNING id`,
        [supplier_name]
      )
      supplier_id = newSupplier.rows[0].id
    }

    await pool.query(
      `UPDATE inventory
       SET supplier_id = $1, quantity = $2, unit = $3,
           location = $4, lot_number = $5, expiration_date = $6, notes = $7
       WHERE id = $8`,
      [supplier_id, quantity, unit, location, lot_number, expiration_date, notes, id]
    )

    res.json({ success: true })
  } catch (err) {
    console.error("PUT error:", err)
    res.status(500).json({ error: "Failed to update inventory" })
  }
}
