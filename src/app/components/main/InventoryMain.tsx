import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/app/components/elements/Button"
import { Card, CardContent } from "@/app/components/elements/Card"
import InventoryFilters from "@/app/components/main/InventoryFilters"
import InventoryTable from "@/app/components/main/InventoryTable"
import type { ChemicalInventoryItem, SortDirection, SortField } from "@/app/types/inventory"

interface InventoryMainProps {
  inventory: ChemicalInventoryItem[]
  onAddNew: () => void
  onEditItem: (item: ChemicalInventoryItem) => void
  isFullInventoryEmpty: boolean
}

const InventoryMain = ({
  inventory,
  onAddNew,
  onEditItem,
  isFullInventoryEmpty
}: InventoryMainProps) => {
  const [sortField, setSortField] = useState<SortField>("chemical_name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [hazardFilter, setHazardFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")

  // Filter and sort inventory
  const filteredAndSortedInventory = useMemo(() => {
    const filtered = inventory.filter(item => {
      const matchesSearch =
        item.chemical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cid_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lot_number.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesHazard = hazardFilter === "all" || item.hazard_class === hazardFilter
      const matchesLocation = locationFilter === "all" || item.location === locationFilter

      return matchesSearch && matchesHazard && matchesLocation
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [inventory, searchTerm, hazardFilter, locationFilter, sortField, sortDirection])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <InventoryFilters
        searchTerm={searchTerm}
        onChangeSearchTerm={setSearchTerm}
        hazardFilter={hazardFilter}
        onChangeHazardFilter={setHazardFilter}
        locationFilter={locationFilter}
        onChangeLocationFilter={setLocationFilter}
        inventory={inventory}
        filteredAndSortedInventory={filteredAndSortedInventory}
      />
      <div className="flex justify-between items-center mb-2">
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
        <p className="text-gray-600 ml-4 text-sm">
          Displaying {filteredAndSortedInventory.length} of {inventory.length} items
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <InventoryTable
            onClickToEdit={onEditItem}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            inventory={filteredAndSortedInventory}
            sortField={sortField}
            sortDirection={sortDirection}
            isFullInventoryEmpty={isFullInventoryEmpty}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryMain
