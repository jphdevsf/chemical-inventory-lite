import { ArrowUpDown, ChevronDown, ChevronUp, Download, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import type { ChemicalInventoryItem } from "./../types/inventory"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface InventoryListProps {
  inventory: ChemicalInventoryItem[]
  onAddNew: () => void
  onEditItem: (item: ChemicalInventoryItem) => void
}

type SortField = keyof ChemicalInventoryItem
type SortDirection = "asc" | "desc"

export function InventoryList({ inventory, onAddNew, onEditItem }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [hazardFilter, setHazardFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("chemicalName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Get unique values for filters
  const uniqueHazardClasses = useMemo(() => {
    const classes = new Set(inventory.map(item => item.hazardClass).filter(Boolean))
    return Array.from(classes).sort()
  }, [inventory])

  const uniqueLocations = useMemo(() => {
    const locations = new Set(inventory.map(item => item.location).filter(Boolean))
    return Array.from(locations).sort()
  }, [inventory])

  // Filter and sort inventory
  const filteredAndSortedInventory = useMemo(() => {
    const filtered = inventory.filter(item => {
      const matchesSearch =
        item.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesHazard = hazardFilter === "all" || item.hazardClass === hazardFilter
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToCSV = () => {
    if (filteredAndSortedInventory.length === 0) {
      alert("No data to export")
      return
    }

    const headers = [
      "ID",
      "Chemical Name",
      "CID Number",
      "Quantity",
      "Unit",
      "Location",
      "Hazard Class",
      "Supplier",
      "Lot Number",
      "Expiration Date",
      "Date Added",
      "Notes"
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedInventory.map(item =>
        [
          item.id,
          `"${item.chemicalName}"`,
          item.cidNumber,
          item.quantity,
          item.unit,
          `"${item.location}"`,
          item.hazardClass,
          `"${item.supplier}"`,
          item.lotNumber,
          item.expirationDate,
          new Date(item.dateAdded).toLocaleDateString(),
          `"${item.notes.replace(/"/g, '""')}"`
        ].join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `chemical_inventory_${new Date().toISOString().split("T")[0]}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline opacity-50" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 inline" />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 md:flex justify-between items-center">
        <h1 className="text-xl md:text-3xl mb-4 md:mb-2 flex items-center">
          <img
            width="36"
            height="36"
            alt="molecule icon"
            className="mr-2"
            src="./chem-inv-lite.svg"
          />
          Chemical Inventory Lite
        </h1>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chemicals, CAS, supplier, lot..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 "
          />
        </div>
        <div className="md:col-span-3">
          <Select value={hazardFilter} onValueChange={setHazardFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Hazard Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hazard Classes</SelectItem>
              {uniqueHazardClasses.map(hazard => (
                <SelectItem key={hazard} value={hazard}>
                  {hazard}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button
            disabled={!(searchTerm || hazardFilter !== "all" || locationFilter !== "all")}
            className="w-full"
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setHazardFilter("all")
              setLocationFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("chemicalName")}
                  >
                    Chemical Name
                    <SortIcon field="chemicalName" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("cidNumber")}
                  >
                    CID Number
                    <SortIcon field="cidNumber" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity
                    <SortIcon field="quantity" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("location")}
                  >
                    Location
                    <SortIcon field="location" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("hazardClass")}
                  >
                    Hazard Class
                    <SortIcon field="hazardClass" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("supplier")}
                  >
                    Supplier
                    <SortIcon field="supplier" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("expirationDate")}
                  >
                    Expiration
                    <SortIcon field="expirationDate" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      {inventory.length === 0
                        ? 'No inventory items. Click "Add New" to get started.'
                        : "No items match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedInventory.map(item => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => onEditItem(item)}
                    >
                      <TableCell>{item.chemicalName}</TableCell>
                      <TableCell>{item.cidNumber || "—"}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{item.location || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            item.hazardClass === "Toxic" || item.hazardClass === "Carcinogen"
                              ? "bg-red-100 text-red-800"
                              : item.hazardClass === "Flammable" || item.hazardClass === "Reactive"
                                ? "bg-orange-100 text-orange-800"
                                : item.hazardClass === "Corrosive"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.hazardClass || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>{item.supplier || "—"}</TableCell>
                      <TableCell>
                        {item.expirationDate
                          ? new Date(item.expirationDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
