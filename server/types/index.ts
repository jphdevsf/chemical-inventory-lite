export interface User {
  id: string
  email: string
  name: string
  isActive: boolean
  roles: Role[]
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface InventoryItem {
  id: string
  chemicalId: string
  supplierId: string | null
  quantity: number
  unit: string
  location: string
  lotNumber: string | null
  expirationDate: string | null
  dateAdded: string
  notes: string | null
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
  chemical: {
    id: string
    chemicalName: string
    cidNumber: string | null
    hazardClass: string | null
  }
  supplier: {
    id: string
    name: string
  } | null
}
