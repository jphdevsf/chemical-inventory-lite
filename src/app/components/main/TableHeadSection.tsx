import SortIcon from "@/app/components/elements/SortIcon"
import { TableHead, TableHeader, TableRow } from "@/app/components/elements/Table"
import type { ChemicalInventoryItem, SortDirection, SortField } from "@/app/types/inventory"

interface TableHeadSectionProps {
  sortField: keyof ChemicalInventoryItem
  sortDirection: SortDirection
  sortOnClick: (field: SortField) => void
}

const TableHeadSection = ({ sortOnClick, sortDirection, sortField }: TableHeadSectionProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("chemical_name")}
        >
          Chemical Name
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="chemical_name" />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("cid_number")}
        >
          CID Number
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="cid_number" />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("quantity")}
        >
          Quantity
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="quantity" />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("location")}
        >
          Location
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="location" />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("hazard_class")}
        >
          Hazard Class
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="hazard_class" />
        </TableHead>
        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => sortOnClick("name")}>
          Supplier
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="name" />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => sortOnClick("expiration_date")}
        >
          Expiration
          <SortIcon sortDirection={sortDirection} sortField={sortField} field="expiration_date" />
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export default TableHeadSection
