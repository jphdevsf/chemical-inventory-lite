import type { ChemicalInventoryItem } from "@/app/types/inventory"

const exportToCSV = (items: ChemicalInventoryItem[], filenamePrefix = "chemical_inventory") => {
  if (items.length === 0) {
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
    ...items.map(item =>
      [
        item.id,
        item.chemical_name,
        item.cid_number,
        item.quantity,
        item.unit,
        item.location,
        item.hazard_class,
        item.name,
        item.lot_number,
        item.expiration_date,
        new Date(item.date_added).toLocaleDateString(),
        item.notes.replace(/"/g, '""')
      ].join(",")
    )
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default exportToCSV
