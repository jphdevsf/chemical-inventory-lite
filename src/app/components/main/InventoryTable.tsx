import { Table, TableBody, TableCell, TableRow } from "@/app/components/elements/Table"
import type { ChemicalInventoryItem, SortDirection, SortField } from "@/app/types/inventory"
import TableHeadSection from "./TableHeadSection"

interface InventoryTableProps {
  inventory: ChemicalInventoryItem[]
  sortField: keyof ChemicalInventoryItem
  setSortField: React.Dispatch<React.SetStateAction<SortField>>
  sortDirection: SortDirection
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>
  onClickToEdit: (item: ChemicalInventoryItem) => void
  isFullInventoryEmpty: boolean
}

const InventoryTable = ({
  inventory,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  onClickToEdit,
  isFullInventoryEmpty
}: InventoryTableProps) => {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeadSection
          sortOnClick={handleSort}
          sortDirection={sortDirection}
          sortField={sortField}
        />
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell className="jacob text-center py-12 text-gray-500 w-full">
                {isFullInventoryEmpty
                  ? 'No inventory items. Click "Add New" to get started.'
                  : "No items match your filters."}
              </TableCell>
            </TableRow>
          ) : (
            inventory.map(item => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onClickToEdit(item)}
              >
                <TableCell>{item.chemical_name}</TableCell>
                <TableCell>{item.cid_number || "—"}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>{item.location || "—"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      item.hazard_class === "Toxic" || item.hazard_class === "Carcinogen"
                        ? "bg-red-100 text-red-800"
                        : item.hazard_class === "Flammable" || item.hazard_class === "Reactive"
                          ? "bg-orange-100 text-orange-800"
                          : item.hazard_class === "Corrosive"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.hazard_class || "N/A"}
                  </span>
                </TableCell>
                <TableCell>{item.name || "—"}</TableCell>
                <TableCell>
                  {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default InventoryTable
