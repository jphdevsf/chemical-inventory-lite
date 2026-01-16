import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AddInventoryForm } from "./components/AddInventoryForm"
import { EditInventoryForm } from "./components/EditInventoryForm"
import Footer from "./components/Footer"
import Head from "./components/Head"
import { InventoryList } from "./components/InventoryList"
import { Toaster } from "./components/ui/sonner"
import type { ChemicalInventoryItem } from "./types/inventory"

type View = "list" | "add" | "edit"

function App() {
  const [currentView, setCurrentView] = useState<View>("list")
  const [inventory, setInventory] = useState<ChemicalInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<ChemicalInventoryItem | null>(null)

  // Fetch inventory data from the server
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3001/data")
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory: ${response.statusText}`)
        }
        const data = await response.json()
        setInventory(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch inventory"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  // Save inventory data to the server
  const saveInventory = async (updatedInventory: ChemicalInventoryItem[]) => {
    try {
      const response = await fetch("http://localhost:3001/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedInventory)
      })

      if (!response.ok) {
        throw new Error(`Failed to save inventory: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save inventory"
      toast.error(errorMessage)
      throw err
    }
  }

  const handleAddInventory = async (items: Omit<ChemicalInventoryItem, "id">[]) => {
    try {
      const newItems = items.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9)
      }))

      const updatedInventory = [...inventory, ...newItems]
      await saveInventory(updatedInventory)
      setInventory(updatedInventory)
      setCurrentView("list")
      toast.success(
        `Successfully added ${newItems.length} chemical${newItems.length > 1 ? "s" : ""} to inventory`
      )
    } catch (err) {
      console.error(err)
      toast.error("Failed to add chemicals to inventory")
    }
  }

  const handleUpdateInventory = async (updatedItem: ChemicalInventoryItem) => {
    try {
      const updatedInventory = inventory.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )

      await saveInventory(updatedInventory)
      setInventory(updatedInventory)
      setCurrentView("list")
      setEditingItem(null)
      toast.success("Chemical updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update chemical")
    }
  }

  const handleDeleteInventory = async (id: string) => {
    try {
      const item = inventory.find(i => i.id === id)
      const updatedInventory = inventory.filter(item => item.id !== id)

      await saveInventory(updatedInventory)
      setInventory(updatedInventory)
      setCurrentView("list")
      setEditingItem(null)
      toast.success(`Deleted ${item?.chemicalName} from inventory`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete chemical")
    }
  }

  const handleEditItem = (item: ChemicalInventoryItem) => {
    setEditingItem(item)
    setCurrentView("edit")
  }

  const handleCancelAdd = () => {
    setCurrentView("list")
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setCurrentView("list")
  }

  return (
    <>
      <Head />
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Loading inventory...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-screen">
            <div className="text-xl text-red-500">Error: {error}</div>
          </div>
        ) : currentView === "list" ? (
          <InventoryList
            inventory={inventory}
            onAddNew={() => setCurrentView("add")}
            onEditItem={handleEditItem}
          />
        ) : currentView === "add" ? (
          <AddInventoryForm onAdd={handleAddInventory} onCancel={handleCancelAdd} />
        ) : currentView === "edit" && editingItem ? (
          <EditInventoryForm
            item={editingItem}
            onUpdate={handleUpdateInventory}
            onDelete={handleDeleteInventory}
            onCancel={handleCancelEdit}
          />
        ) : null}

        <Toaster />
      </div>
      <Footer />
    </>
  )
}

export default App
