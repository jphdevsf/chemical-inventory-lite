import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import type { SortDirection, SortField } from "@/app/types/inventory"

interface SortFieldProps {
  field: SortField
  sortField: SortField
  sortDirection: SortDirection
}

const SortIcon = ({ field, sortField, sortDirection }: SortFieldProps) => {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1 inline opacity-50" />
  }
  return sortDirection === "asc" ? (
    <ChevronUp className="h-4 w-4 ml-1 inline" />
  ) : (
    <ChevronDown className="h-4 w-4 ml-1 inline" />
  )
}

export default SortIcon
