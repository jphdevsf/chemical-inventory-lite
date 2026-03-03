import dotenv from "dotenv"
import { pool } from "./dbConfig.js"

dotenv.config()

const testDatabaseConnection = async () => {
  console.log("🔍 Testing Neon Database Connection...\n")

  try {
    // Test 1: Connection
    console.log("1️⃣ Testing database connection...")
    const client = await pool.connect()
    console.log("✅ Successfully connected to Neon database\n")
    client.release()

    // Test 2: Schema check
    console.log("2️⃣ Verifying database schema...")
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    const tablesResult = await pool.query(tablesQuery)
    const tables = tablesResult.rows.map(r => r.table_name)
    console.log("   Tables found:", tables)

    const expectedTables = [
      "chemicals",
      "suppliers",
      "inventory",
      "users",
      "user_roles",
      "user_role_assignments"
    ]
    const missingTables = expectedTables.filter(t => !tables.includes(t))

    if (missingTables.length > 0) {
      console.log("   ⚠️  Missing tables:", missingTables)
    } else {
      console.log("   ✅ All expected tables present\n")
    }

    // Test 3: Test SELECT query
    console.log("3️⃣ Testing SELECT query...")
    const selectResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM inventory
    `)
    console.log(`   ✅ Found ${selectResult.rows[0].count} inventory items\n`)

    // Test 4: Test INSERT with rollback
    console.log("4️⃣ Testing INSERT operation (with rollback)...")
    const testClient = await pool.connect()
    try {
      await testClient.query("BEGIN")

      const testChemical = await testClient.query(
        "INSERT INTO chemicals (chemical_name, cid_number, hazard_class) VALUES ($1, $2, $3) RETURNING id",
        ["Test Chemical", "123-45-6", "Test Hazard"]
      )
      console.log(`   ✅ Successfully inserted test chemical with ID: ${testChemical.rows[0].id}`)

      await testClient.query("ROLLBACK")
      console.log("   ✅ Successfully rolled back test insertion\n")
    } finally {
      testClient.release()
    }

    // Test 5: Test JOIN query
    console.log("5️⃣ Testing JOIN query...")
    const joinResult = await pool.query(`
      SELECT 
        COUNT(*) as count
      FROM inventory
      INNER JOIN chemicals ON inventory.chemical_id = chemicals.id
      INNER JOIN suppliers ON inventory.supplier_id = suppliers.id
    `)
    console.log(`   ✅ Found ${joinResult.rows[0].count} joined inventory records\n`)

    console.log("🎉 All database tests passed successfully!")
  } catch (error) {
    console.error("❌ Database test failed:", error.message)
    console.error("   Details:", error.detail || "No additional details")
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testDatabaseConnection()
