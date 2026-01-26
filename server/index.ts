import cors from "cors"
import { eq } from "drizzle-orm"
import express from "express"
import { db } from "./db/index.js"
import { users } from "./db/schema.js"
import { authMiddleware } from "./middleware/auth.js"
import { getUsers, login, register } from "./routes/auth.js"
import { addChemical, getChemicals } from "./routes/chemicals.js"
import { addInventory, deleteInventory, getInventory, updateInventory } from "./routes/inventory.js"
import { addSupplier, getSuppliers, updateSupplier } from "./routes/suppliers.js"

const app = express()
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
)
app.use(express.json())

// Public routes
app.post("/auth/login", login)
app.post("/auth/register", authMiddleware(["admin"]), register) // Admin only

// Protected routes
app.get("/inventory", authMiddleware(["view_only", "user_edit", "admin"]), getInventory)
app.post("/inventory", authMiddleware(["user_edit", "admin"]), addInventory)
app.put("/inventory/:id", authMiddleware(["user_edit", "admin"]), updateInventory)
app.delete("/inventory/:id", authMiddleware(["admin"]), deleteInventory)

app.get("/suppliers", authMiddleware(["user_edit", "admin"]), getSuppliers)
app.post("/suppliers", authMiddleware(["user_edit", "admin"]), addSupplier)
app.put("/suppliers/:id", authMiddleware(["user_edit", "admin"]), updateSupplier)

app.get("/chemicals", authMiddleware(["view_only", "user_edit", "admin"]), getChemicals)
app.post("/chemicals", authMiddleware(["user_edit", "admin"]), addChemical)

app.get("/users", authMiddleware(["admin"]), getUsers)

// Health check
app.get("/health", async (req, res) => {
  try {
    await db.select().from(users).limit(1)
    res.json({ status: "OK", message: "Database connected" })
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: "Database connection failed" })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
