export interface ChemicalInventoryItem {
  id: string;
  chemicalName: string;
  cidNumber: string;
  quantity: number;
  unit: string;
  location: string;
  hazardClass: string;
  supplier: string;
  lotNumber: string;
  expirationDate: string;
  dateAdded: string;
  notes: string;
}
