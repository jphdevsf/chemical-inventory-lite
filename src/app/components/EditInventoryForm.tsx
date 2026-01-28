import { Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/app/components/elements/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/app/components/elements/Card"
import { Label } from "@/app/components/elements/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/elements/Select"
import { Textarea } from "@/app/components/elements/Textarea"
import { ChemicalDeleteDialog } from "@/app/components/inventory/ChemicalDeleteDialog"
import { ChemicalFormHeader } from "@/app/components/inventory/ChemicalFormHeader"
import { HAZARD_CLASSES, UNITS } from "@/app/components/inventory/constants"
import { FormField } from "@/app/components/inventory/form/FormField"
import type { ChemicalInventoryItem } from "@/app/types/inventory"

interface EditInventoryFormProps {
  item: ChemicalInventoryItem
  onUpdate: (item: ChemicalInventoryItem) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

const EditInventoryForm = ({ item, onUpdate, onDelete, onCancel }: EditInventoryFormProps) => {
  const [formData, setFormData] = useState<ChemicalInventoryItem>(item)
  const handleFieldChange = (field: keyof ChemicalInventoryItem, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.chemical_name.trim() || !formData.quantity || !formData.expiration_date) {
      alert("Chemical name, Quantity, and Expiration Date  are required")
      return
    }
    console.log("JPH", formData)
    onUpdate(formData)
  }

  const handleDelete = () => {
    onDelete(item.id)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ChemicalFormHeader
        title={`Editing ${item.chemical_name}`}
        subtitle={`ID: ${item.id}`}
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chemical Details</CardTitle>
            <CardDescription>
              Added on {new Date(item.date_added).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="chemical_name"
                label="Chemical Name"
                value={formData.chemical_name}
                onChange={value => handleFieldChange("chemical_name", value)}
                placeholder="e.g., Sodium Chloride"
                required
                requiredMarker
              />

              <FormField
                id="cid_number"
                label="CID Number"
                value={formData.cid_number}
                onChange={value => handleFieldChange("cid_number", value)}
                placeholder="e.g., 7647-14-5"
              />

              <FormField
                id="quantity"
                label="Quantity"
                value={formData.quantity}
                onChange={value => handleFieldChange("quantity", value)}
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                requiredMarker
              />

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={value => handleFieldChange("unit", value)}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                id="location"
                label="Storage Location"
                value={formData.location}
                onChange={value => handleFieldChange("location", value)}
                placeholder="e.g., Cabinet A, Shelf 2"
              />

              <div className="space-y-2">
                <Label htmlFor="hazard_class">Hazard Class</Label>
                <Select
                  value={formData.hazard_class}
                  onValueChange={value => handleFieldChange("hazard_class", value)}
                >
                  <SelectTrigger id="hazard_class">
                    <SelectValue placeholder="Select hazard class" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAZARD_CLASSES.map(hazard => (
                      <SelectItem key={hazard.value} value={hazard.value}>
                        {hazard.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                id="name"
                label="Supplier"
                value={formData.name}
                onChange={value => handleFieldChange("name", value)}
                placeholder="e.g., Sigma-Aldrich"
              />

              <FormField
                id="lot_number"
                label="Lot Number"
                value={formData.lot_number}
                onChange={value => handleFieldChange("lot_number", value)}
                placeholder="e.g., LOT12345"
              />

              <FormField
                id="expiration_date"
                label="Expiration Date"
                value={formData.expiration_date ? formData.expiration_date.split("T")[0] : ""}
                onChange={value => handleFieldChange("expiration_date", value)}
                type="date"
              />

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => handleFieldChange("notes", e.target.value)}
                  placeholder="Additional notes or comments"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex-col md:flex-row flex gap-3">
          <Button type="submit" className="">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <div className="flex w-full justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 order-1 md:order-0"
            >
              Cancel
            </Button>
            <div className="flex-4 hidden md:block" />
            <ChemicalDeleteDialog chemicalName={item.chemical_name} onDelete={handleDelete} />
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditInventoryForm
