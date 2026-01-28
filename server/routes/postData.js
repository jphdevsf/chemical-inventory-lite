import { pool } from "../dbConfig.js"

/**
 * Add new
 */
export const postData = async (req, res) => {
  try {
    const items = req.body
    console.log("POST /data received items:", JSON.stringify(items))
    const results = []
    const errors = []

    for (const item of items) {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        const chemicalResult = await client.query(
          `SELECT id FROM chemicals WHERE chemical_name = $1`,
          [item.chemical_name]
        )
        console.log("Chemical lookup result:", chemicalResult.rows.length)

        let chemical_id
        if (chemicalResult.rows.length > 0) {
          chemical_id = chemicalResult.rows[0].id
          console.log("Found existing chemical_id:", chemical_id)
        } else {
          const newChemical = await client.query(
            `INSERT INTO chemicals (chemical_name, cid_number, hazard_class) VALUES ($1, $2, $3) RETURNING id`,
            [item.chemical_name, item.cid_number, item.hazard_class]
          )
          chemical_id = newChemical.rows[0].id
          console.log("Created new chemical_id:", chemical_id)
        }

        let supplier_id
        const existingSupplier = await client.query(`SELECT id FROM suppliers WHERE name = $1`, [
          item.name
        ])
        console.log("Supplier lookup result:", existingSupplier.rows.length, "for name:", item.name)

        if (existingSupplier.rows.length > 0) {
          supplier_id = existingSupplier.rows[0].id
          console.log("Found existing supplier_id:", supplier_id)
        } else {
          const newSupplier = await client.query(
            `INSERT INTO suppliers (name) VALUES ($1) RETURNING id`,
            [item.name]
          )
          supplier_id = newSupplier.rows[0].id
          console.log("Created new supplier_id:", supplier_id)
        }

        console.log(
          "About to insert inventory with chemical_id:",
          chemical_id,
          "supplier_id:",
          supplier_id
        )
        const inventoryResult = await client.query(
          `INSERT INTO inventory
           (id, chemical_id, supplier_id, quantity, unit, location, lot_number, expiration_date, date_added, notes, created_by, updated_by)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'f2b26b25-be58-442c-a457-87dbad7c8843', 'f2b26b25-be58-442c-a457-87dbad7c8843')
           RETURNING *`,
          [
            chemical_id,
            supplier_id,
            String(item.quantity),
            item.unit,
            item.location,
            item.lot_number,
            item.expiration_date,
            item.date_added,
            item.notes
          ]
        )

        await client.query("COMMIT")

        // Fetch complete data with joins (matching GET endpoint structure)
        const fullDataResult = await client.query(
          `
          SELECT inventory.id, quantity, unit, location, lot_number, expiration_date, date_added, notes, chemical_name, cid_number, hazard_class, suppliers.name
          FROM inventory
          INNER JOIN chemicals ON inventory.chemical_id = chemicals.id
          INNER JOIN suppliers ON inventory.supplier_id = suppliers.id
          WHERE inventory.id = $1
        `,
          [inventoryResult.rows[0].id]
        )

        results.push(fullDataResult.rows[0])
        console.log("Successfully inserted inventory item")
      } catch (err) {
        console.error("Error in transaction:", err.message, err.detail)
        await client.query("ROLLBACK")
        errors.push({ item, error: err.message })
      } finally {
        client.release()
      }
    }

    res.json({ success: true, data: results, errors })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to save inventory" })
  }
}
