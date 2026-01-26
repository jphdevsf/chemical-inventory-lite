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

const tablesDir = path.resolve("./temp/tables")

// READ (joined view)
app.get("/data", (req, res) => {
  try {
    const readFile = file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(tablesDir, file), "utf-8"))
      } catch {
        return []
      }
    }

    const chemicals = readFile("chemicals.json")
    const suppliers = readFile("suppliers.json")
    const locations = readFile("locations.json")
    const inventory = readFile("inventory.json")
    const notes = readFile("notes.json")

    const data = inventory.map(inv => {
      const chem = chemicals.find(c => c.id === inv.chemicalId) || {}
      const sup = suppliers.find(s => s.id === inv.supplierId) || { name: "" }
      const loc = locations.find(l => l.id === inv.locationId) || { name: "" }
      const note = notes
        .filter(n => n.inventoryId === inv.id)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || { content: "" }

      return {
        id: inv.id,
        chemicalName: chem.chemicalName || "",
        cidNumber: chem.cidNumber || "",
        quantity: inv.quantity,
        unit: inv.unit,
        location: loc.name,
        hazardClass: chem.hazardClass || "",
        supplier: sup.name,
        lotNumber: inv.lotNumber || "",
        expirationDate: inv.expirationDate || "",
        dateAdded: inv.dateAdded,
        notes: note.content
      }
    })

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to read tables" })
  }
})

// WRITE (normalize and update tables)
app.post("/data", (req, res) => {
  try {
    const readFile = file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(tablesDir, file), "utf-8"))
      } catch {
        return []
      }
    }

    const chemicals = readFile("chemicals.json")
    const suppliers = readFile("suppliers.json")
    const locations = readFile("locations.json")
    const notesList = readFile("notes.json")
    const inventory = readFile("inventory.json")

    const body = Array.isArray(req.body) ? req.body : [req.body]
    const newInventory = [...inventory]
    const newNotes = [...notesList]
    let nextChemId = chemicals.length
      ? Math.max(...chemicals.map(c => parseInt(c.id.split("-")[1]) || 0)) + 1
      : 1
    let nextSupId = suppliers.length
      ? Math.max(...suppliers.map(s => parseInt(s.id.split("-")[1]) || 0)) + 1
      : 1
    let nextLocId = locations.length
      ? Math.max(...locations.map(l => parseInt(l.id.split("-")[1]) || 0)) + 1
      : 1
    const nextInvId = inventory.length ? inventory.length + 1 : 1
    let nextNoteId = notesList.length
      ? Math.max(...notesList.map(n => parseInt(n.id.split("-")[1]) || 0)) + 1
      : 1

    body.forEach(item => {
      // Find or create chemical
      let chem = chemicals.find(
        c => c.chemicalName === item.chemicalName && c.cidNumber === (item.cidNumber || "")
      )
      if (!chem) {
        chem = {
          id: `chem-${nextChemId++}`,
          chemicalName: item.chemicalName || "",
          cidNumber: item.cidNumber || "",
          hazardClass: item.hazardClass || "Unknown"
        }
        chemicals.push(chem)
      }

      // Supplier
      let supId = null
      if (item.supplier && item.supplier.trim()) {
        let sup = suppliers.find(s => s.name === item.supplier.trim())
        if (!sup) {
          sup = { id: `sup-${nextSupId++}`, name: item.supplier.trim() }
          suppliers.push(sup)
        }
        supId = sup.id
      }

      // Location
      let locId = null
      if (item.location && item.location.trim()) {
        let loc = locations.find(l => l.name === item.location.trim())
        if (!loc) {
          loc = { id: `loc-${nextLocId++}`, name: item.location.trim() }
          locations.push(loc)
        }
        locId = loc.id
      }

      const invId = item.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const inv = {
        id: invId,
        chemicalId: chem.id,
        supplierId: supId,
        locationId: locId,
        quantity: item.quantity,
        unit: item.unit || "g",
        lotNumber: item.lotNumber || "",
        expirationDate: item.expirationDate || "",
        dateAdded: item.dateAdded || new Date().toISOString()
      }
      newInventory.push(inv)

      // Notes
      if (item.notes && item.notes.trim()) {
        const existingNote = newNotes.find(n => n.inventoryId === invId)
        const noteId = existingNote ? existingNote.id : `note-${nextNoteId++}`
        const note = {
          id: noteId,
          inventoryId: invId,
          content: item.notes.trim(),
          updatedBy: null, // No auth yet
          updatedAt: item.dateAdded || new Date().toISOString()
        }
        if (existingNote) {
          const idx = newNotes.indexOf(existingNote)
          newNotes[idx] = note
        } else {
          newNotes.push(note)
        }
      }
    })

    // Write back
    fs.writeFileSync(path.join(tablesDir, "chemicals.json"), JSON.stringify(chemicals, null, 2))
    fs.writeFileSync(path.join(tablesDir, "suppliers.json"), JSON.stringify(suppliers, null, 2))
    fs.writeFileSync(path.join(tablesDir, "locations.json"), JSON.stringify(locations, null, 2))
    fs.writeFileSync(path.join(tablesDir, "inventory.json"), JSON.stringify(newInventory, null, 2))
    fs.writeFileSync(path.join(tablesDir, "notes.json"), JSON.stringify(newNotes, null, 2))

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to write tables" })
  }
})

// UPDATE
app.put("/data/:id", (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const readFile = file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(tablesDir, file), "utf-8"))
      } catch {
        return []
      }
    }

    const chemicals = readFile("chemicals.json")
    const suppliers = readFile("suppliers.json")
    const locations = readFile("locations.json")
    const inventory = readFile("inventory.json")
    const notesList = readFile("notes.json")

    const invIndex = inventory.findIndex(i => i.id === id)
    if (invIndex === -1) {
      return res.status(404).json({ error: "Item not found" })
    }

    const inv = inventory[invIndex]

    // Update chemical if name or cid changed
    if (updateData.chemicalName || updateData.cidNumber !== undefined) {
      const chem = chemicals.find(c => c.id === inv.chemicalId)
      if (chem) {
        if (updateData.chemicalName) chem.chemicalName = updateData.chemicalName
        if (updateData.cidNumber !== undefined) chem.cidNumber = updateData.cidNumber || ""
        if (updateData.hazardClass !== undefined)
          chem.hazardClass = updateData.hazardClass || "Unknown"
      }
    }

    // Update supplier
    if (updateData.supplier !== undefined) {
      let supId = null
      if (updateData.supplier && updateData.supplier.trim()) {
        let sup = suppliers.find(s => s.name === updateData.supplier.trim())
        if (!sup) {
          const nextSupId = suppliers.length
            ? Math.max(...suppliers.map(s => parseInt(s.id.split("-")[1]) || 0)) + 1
            : 1
          sup = { id: `sup-${nextSupId}`, name: updateData.supplier.trim() }
          suppliers.push(sup)
        }
        supId = sup.id
      }
      inv.supplierId = supId
    }

    // Update location
    if (updateData.location !== undefined) {
      let locId = null
      if (updateData.location && updateData.location.trim()) {
        let loc = locations.find(l => l.name === updateData.location.trim())
        if (!loc) {
          const nextLocId = locations.length
            ? Math.max(...locations.map(l => parseInt(l.id.split("-")[1]) || 0)) + 1
            : 1
          loc = { id: `loc-${nextLocId}`, name: updateData.location.trim() }
          locations.push(loc)
        }
        locId = loc.id
      }
      inv.locationId = locId
    }

    // Update other fields
    if (updateData.quantity !== undefined) inv.quantity = updateData.quantity
    if (updateData.unit !== undefined) inv.unit = updateData.unit
    if (updateData.lotNumber !== undefined) inv.lotNumber = updateData.lotNumber
    if (updateData.expirationDate !== undefined) inv.expirationDate = updateData.expirationDate
    if (updateData.dateAdded !== undefined) inv.dateAdded = updateData.dateAdded

    inventory[invIndex] = inv

    // Update notes
    if (updateData.notes !== undefined) {
      const existingNote = notesList.find(n => n.inventoryId === id)
      const nextNoteId = notesList.length
        ? Math.max(...notesList.map(n => parseInt(n.id.split("-")[1]) || 0)) + 1
        : 1
      const note = {
        id: existingNote ? existingNote.id : `note-${nextNoteId}`,
        inventoryId: id,
        content: updateData.notes || "",
        updatedBy: null,
        updatedAt: new Date().toISOString()
      }
      if (existingNote) {
        const idx = notesList.indexOf(existingNote)
        notesList[idx] = note
      } else {
        notesList.push(note)
      }
    }

    // Write back
    fs.writeFileSync(path.join(tablesDir, "chemicals.json"), JSON.stringify(chemicals, null, 2))
    fs.writeFileSync(path.join(tablesDir, "suppliers.json"), JSON.stringify(suppliers, null, 2))
    fs.writeFileSync(path.join(tablesDir, "locations.json"), JSON.stringify(locations, null, 2))
    fs.writeFileSync(path.join(tablesDir, "inventory.json"), JSON.stringify(inventory, null, 2))
    fs.writeFileSync(path.join(tablesDir, "notes.json"), JSON.stringify(notesList, null, 2))

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update" })
  }
})

// DELETE
app.delete("/data/:id", (req, res) => {
  try {
    const { id } = req.params

    const readFile = file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(tablesDir, file), "utf-8"))
      } catch {
        return []
      }
    }

    const inventory = readFile("inventory.json")
    let notesList = readFile("notes.json")

    const invIndex = inventory.findIndex(i => i.id === id)
    if (invIndex === -1) {
      return res.status(404).json({ error: "Item not found" })
    }

    inventory.splice(invIndex, 1)

    // Remove related notes
    notesList = notesList.filter(n => n.inventoryId !== id)

    // Write back
    fs.writeFileSync(path.join(tablesDir, "inventory.json"), JSON.stringify(inventory, null, 2))
    fs.writeFileSync(path.join(tablesDir, "notes.json"), JSON.stringify(notesList, null, 2))

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to delete" })
  }
})

app.listen(3001, () => {
  console.log("Express server running on http://localhost:3001")
})
