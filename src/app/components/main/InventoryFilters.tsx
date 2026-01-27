import { Download, Search } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/app/components/elements/Button"
import { Input } from "@/app/components/elements/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/elements/Select"
import type { ChemicalInventoryItem } from "@/app/types/inventory"
import exportToCSV from "@/app/utils/exportToCSV"

interface InventoryFiltersProps {
  inventory: ChemicalInventoryItem[]
  filteredAndSortedInventory: ChemicalInventoryItem[]
  searchTerm: string
  onChangeSearchTerm: (x: string) => void
  hazardFilter: string
  onChangeHazardFilter: (x: string) => void
  locationFilter: string
  onChangeLocationFilter: (x: string) => void
}

const InventoryFilters = ({
  searchTerm,
  onChangeSearchTerm,
  hazardFilter,
  onChangeHazardFilter,
  locationFilter,
  onChangeLocationFilter,
  inventory,
  filteredAndSortedInventory
}: InventoryFiltersProps) => {
  // Get unique values for filters
  const uniqueHazardClasses = useMemo(() => {
    const classes = new Set(inventory.map(item => item.hazard_class).filter(Boolean))
    return Array.from(classes).sort()
  }, [inventory])

  const uniqueLocations = useMemo(() => {
    const locations = new Set(inventory.map(item => item.location).filter(Boolean))
    return Array.from(locations).sort()
  }, [inventory])

  return (
    <>
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
        <Button onClick={() => exportToCSV(filteredAndSortedInventory)} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chemicals, CAS, name, lot..."
            value={searchTerm}
            onChange={e => onChangeSearchTerm(e.target.value)}
            className="pl-10 "
          />
        </div>
        <div className="md:col-span-3">
          <Select value={hazardFilter} onValueChange={onChangeHazardFilter}>
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
          <Select value={locationFilter} onValueChange={onChangeLocationFilter}>
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
              onChangeSearchTerm("")
              onChangeHazardFilter("all")
              onChangeLocationFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </>
  )
}

export default InventoryFilters
