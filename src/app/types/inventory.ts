export interface ChemicalInventoryItem {
  id: string;
  quantity: number;
  unit: string;
  location: string;
  lot_number: string;
  expiration_date: string;
  date_added: string;
  notes: string;
  chemical_name: string;
  cid_number: string;
  hazard_class: string;
  name: string;
}


export type SortField = keyof ChemicalInventoryItem;
export type SortDirection = "asc" | "desc";

export interface SortableTableProps<T extends Record<string, unknown>> {
  data: T[];
  sortField: keyof T;
  sortDirection: SortDirection;
  onSortChange: (field: keyof T, direction: SortDirection) => void;
  // ...other common props
}