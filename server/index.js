import fs from "node:fs"
import path from "node:path"
import express from "express"

const app = express()
app.use(express.json())

// Add CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

const filePath = path.resolve("./temp/data.json")

// READ
app.get("/data", (req, res) => {
  try {
    const json = fs.readFileSync(filePath, "utf-8")
    res.json(JSON.parse(json))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to read file" })
  }
})

// WRITE
app.post("/data", (req, res) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to write file" })
  }
})

app.listen(3001, () => {
  console.log("Express server running on http://localhost:3001")
})
