import { pool } from "../dbConfig.js"

/**
 * Delete item
 */
export const deleteData = async (req, res) => {
  try {
    const { id } = req.body

    const result = await pool.query(`DELETE FROM inventory WHERE id = $1 RETURNING *`, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    res.json({ success: true })
  } catch (err) {
    console.error("DELETE error:", err)
    res.status(500).json({ error: "Failed to delete inventory" })
  }
}
