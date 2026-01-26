import { useQuery } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import AddInventoryForm from "../components/AddInventoryForm"
import EditInventoryForm from "../components/EditInventoryForm"
import InventoryList from "../components/InventoryList"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"
import type { ChemicalInventoryItem } from "../types/inventory"

const Inventory = () => {
  const { user, token, logout } = useAuth()
  const [editingItem, setEditingItem] = useState<ChemicalInventoryItem | null>(null)

  const { data: inventory, refetch } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3001/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
    enabled: !!token
  })

  const handleAddInventory = async items => {
    try {
      const response = await fetch("http://localhost:3001/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(items)
      })
      if (!response.ok) throw new Error("Failed to add")
      refetch()
      toast.success("Added successfully")
    } catch {
      toast.error("Failed to add")
    }
  }

  const handleUpdateInventory = async updatedItem => {
    try {
      const response = await fetch(`http://localhost:3001/inventory/${updatedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedItem)
      })
      if (!response.ok) throw new Error("Failed to update")
      refetch()
      setEditingItem(null)
      toast.success("Updated successfully")
    } catch {
      toast.error("Failed to update")
    }
  }

  const handleDeleteInventory = async id => {
    if (!confirm("Are you sure?")) return

    try {
      const response = await fetch(`http://localhost:3001/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Failed to delete")
      refetch()
      toast.success("Deleted successfully")
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (user?.roles.includes("view_only")) {
    // Show only view buttons
    // Implement view-only mode
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chemical Inventory</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Role: {user?.roles.join(", ")}</span>
          <Button variant="outline" onClick={logout} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryList
            inventory={inventory || []}
            onAddNew={() => setEditingItem(null)}
            onEditItem={setEditingItem}
            onDelete={handleDeleteInventory}
            user={user}
            token={token}
          />
        </div>
        <div className="lg:col-span-1">
          {editingItem ? (
            <EditInventoryForm item={editingItem} onUpdate={handleUpdateInventory} token={token} />
          ) : (
            <AddInventoryForm onAdd={handleAddInventory} token={token} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventory
