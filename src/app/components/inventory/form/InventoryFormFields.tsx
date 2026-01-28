import { Label } from "@/app/components/elements/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/elements/Select"
import { Textarea } from "@/app/components/elements/Textarea"
import { HAZARD_CLASSES, UNITS } from "@/app/components/inventory/constants"
import { FormField } from "@/app/components/inventory/form/FormField"
import type { ChemicalInventoryItem } from "@/app/types/inventory"

interface InventoryFormFieldsProps {
  formData: ChemicalInventoryItem
  onChange: (field: keyof ChemicalInventoryItem, value: string | number) => void
  idPrefix?: string
}

export const InventoryFormFields = ({
  formData,
  onChange,
  idPrefix = ""
}: InventoryFormFieldsProps) => {
  const prefix = idPrefix ? `${idPrefix}-` : ""

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        id={`${prefix}chemical_name`}
        label="Chemical Name"
        value={formData.chemical_name}
        onChange={value => onChange("chemical_name", value)}
        placeholder="e.g., Sodium Chloride"
        required
        requiredMarker
      />

      <FormField
        id={`${prefix}cid_number`}
        label="CID Number"
        value={formData.cid_number}
        onChange={value => onChange("cid_number", value)}
        placeholder="e.g., 7647-14-5"
      />

      <FormField
        id={`${prefix}quantity`}
        label="Quantity"
        value={formData.quantity}
        onChange={value => onChange("quantity", value)}
        type="number"
        step="0.01"
        placeholder="0.00"
        required
        requiredMarker
      />

      <div className="space-y-2">
        <Label htmlFor={`${prefix}unit`}>Unit</Label>
        <Select value={formData.unit} onValueChange={value => onChange("unit", value)}>
          <SelectTrigger id={`${prefix}unit`}>
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
        id={`${prefix}location`}
        label="Storage Location"
        value={formData.location}
        onChange={value => onChange("location", value)}
        placeholder="e.g., Cabinet A, Shelf 2"
      />

      <div className="space-y-2">
        <Label htmlFor={`${prefix}hazard_class`}>Hazard Class</Label>
        <Select
          value={formData.hazard_class}
          onValueChange={value => onChange("hazard_class", value)}
        >
          <SelectTrigger id={`${prefix}hazard_class`}>
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
        id={`${prefix}name`}
        label="Supplier"
        value={formData.name}
        onChange={value => onChange("name", value)}
        placeholder="e.g., Sigma-Aldrich"
      />

      <FormField
        id={`${prefix}lot_number`}
        label="Lot Number"
        value={formData.lot_number}
        onChange={value => onChange("lot_number", value)}
        placeholder="e.g., LOT12345"
      />

      <FormField
        id={`${prefix}expiration_date`}
        label="Expiration Date"
        value={formData.expiration_date?.split("T")[0] ?? ""}
        onChange={value => onChange("expiration_date", value)}
        type="date"
      />

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${prefix}notes`}>Notes</Label>
        <Textarea
          id={`${prefix}notes`}
          value={formData.notes}
          onChange={e => onChange("notes", e.target.value)}
          placeholder="Additional notes or comments"
          rows={4}
        />
      </div>
    </div>
  )
}
