import { Plus, Save, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/app/components/elements/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/app/components/elements/Card"
import { Input } from "@/app/components/elements/Input"
import { Label } from "@/app/components/elements/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/elements/Select"
import { Textarea } from "@/app/components/elements/Textarea"
import type { ChemicalInventoryItem } from "@/app/types/inventory"

interface AddInventoryFormProps {
  onAdd: (items: Omit<ChemicalInventoryItem, "id">[]) => void
  onCancel: () => void
}

interface FormItem {
  tempId: string
  chemical_name: string
  cid_number: string
  quantity: string
  unit: string
  location: string
  hazard_class: string
  name: string
  lot_number: string
  expiration_date: string
  notes: string
}

const emptyFormItem = (): FormItem => ({
  tempId: Math.random().toString(36).substr(2, 9),
  chemical_name: "",
  cid_number: "",
  quantity: "",
  unit: "",
  location: "",
  hazard_class: "",
  name: "",
  lot_number: "",
  expiration_date: "",
  notes: ""
})

const AddInventoryForm = ({ onAdd, onCancel }: AddInventoryFormProps) => {
  const [formItems, setFormItems] = useState<FormItem[]>([emptyFormItem()])

  const handleAddAnother = () => {
    setFormItems([...formItems, emptyFormItem()])
  }

  const handleRemoveItem = (tempId: string) => {
    if (formItems.length === 1) return
    setFormItems(formItems.filter(item => item.tempId !== tempId))
  }

  const handleFieldChange = (tempId: string, field: keyof FormItem, value: string) => {
    setFormItems(
      formItems.map(item => (item.tempId === tempId ? { ...item, [field]: value } : item))
    )
  }

  // // external api loopup
  // async function getCID(chemical_name: string) {
  //   try {
  //     const response = await fetch(
  //       `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${chemical_name}/cids/JSON`
  //     )

  //     if (!response.ok) {
  //       return "No CID found"
  //     }

  //     const data = await response.json()

  //     if (data.IdentifierList?.CID && data.IdentifierList.CID.length > 0) {
  //       return data.IdentifierList.CID[0]
  //     } else {
  //       return "No CID found"
  //     }
  //   } catch (error) {
  //     console.error("Error fetching CID:", error)
  //     return "No CID found"
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least chemical name and quantity are filled
    const validItems = formItems.filter(
      item =>
        item.chemical_name.trim() !== "" &&
        item.quantity.trim() !== "" &&
        item.unit !== "" &&
        item.expiration_date !== ""
    )

    if (validItems.length === 0) {
      alert(
        "Please fill in all required fields (chemical name, quantity, unit, expiration date) for at least one item"
      )
      return
    }

    const itemsToAdd = await Promise.all(
      validItems.map(async item => {
        // external api loopup
        // const CID = await getCID(item.chemical_name)
        return {
          chemical_name: item.chemical_name,
          cid_number: item.cid_number,
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit,
          location: item.location,
          hazard_class: item.hazard_class,
          name: item.name,
          lot_number: item.lot_number,
          expiration_date: item.expiration_date,
          notes: item.notes,
          date_added: new Date().toISOString()
        }
      })
    )

    onAdd(itemsToAdd)
  }
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Add Chemical Inventory</h1>
        <p className="text-gray-600">Enter information for one or more chemicals</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {formItems.map((item, index) => (
            <Card key={item.tempId}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chemical {index + 1}</CardTitle>
                    <CardDescription>Enter chemical details</CardDescription>
                  </div>
                  {formItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.tempId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`chemical_name-${item.tempId}`}>
                      Chemical Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`chemical_name-${item.tempId}`}
                      value={item.chemical_name}
                      onChange={e =>
                        handleFieldChange(item.tempId, "chemical_name", e.target.value)
                      }
                      placeholder="e.g., Sodium Chloride"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cid_number-${item.tempId}`}>CID Number</Label>
                    <Input
                      id={`cid_number-${item.tempId}`}
                      value={item.cid_number}
                      onChange={e => handleFieldChange(item.tempId, "cid_number", e.target.value)}
                      placeholder="e.g., 7647-14-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${item.tempId}`}>
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`quantity-${item.tempId}`}
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={e => handleFieldChange(item.tempId, "quantity", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`unit-${item.tempId}`}>
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={item.unit}
                      onValueChange={value => handleFieldChange(item.tempId, "unit", value)}
                    >
                      <SelectTrigger id={`unit-${item.tempId}`}>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g (grams)</SelectItem>
                        <SelectItem value="kg">kg (kilograms)</SelectItem>
                        <SelectItem value="mg">mg (milligrams)</SelectItem>
                        <SelectItem value="mL">mL (milliliters)</SelectItem>
                        <SelectItem value="L">L (liters)</SelectItem>
                        <SelectItem value="units">units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`location-${item.tempId}`}>Storage Location</Label>
                    <Input
                      id={`location-${item.tempId}`}
                      value={item.location}
                      onChange={e => handleFieldChange(item.tempId, "location", e.target.value)}
                      placeholder="e.g., Cabinet A, Shelf 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`hazard_class-${item.tempId}`}>Hazard Class</Label>
                    <Select
                      value={item.hazard_class}
                      onValueChange={value => handleFieldChange(item.tempId, "hazard_class", value)}
                    >
                      <SelectTrigger id={`hazard_class-${item.tempId}`}>
                        <SelectValue placeholder="Select hazard class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Non-Hazardous">Non-Hazardous</SelectItem>
                        <SelectItem value="Flammable">Flammable</SelectItem>
                        <SelectItem value="Corrosive">Corrosive</SelectItem>
                        <SelectItem value="Toxic">Toxic</SelectItem>
                        <SelectItem value="Oxidizer">Oxidizer</SelectItem>
                        <SelectItem value="Reactive">Reactive</SelectItem>
                        <SelectItem value="Carcinogen">Carcinogen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`name-${item.tempId}`}>Supplier</Label>
                    <Input
                      id={`name-${item.tempId}`}
                      value={item.name}
                      onChange={e => handleFieldChange(item.tempId, "name", e.target.value)}
                      placeholder="e.g., Sigma-Aldrich"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`lot_number-${item.tempId}`}>Lot Number</Label>
                    <Input
                      id={`lot_number-${item.tempId}`}
                      value={item.lot_number}
                      onChange={e => handleFieldChange(item.tempId, "lot_number", e.target.value)}
                      placeholder="e.g., LOT12345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`expiration_date-${item.tempId}`}>
                      Expiration Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`expiration_date-${item.tempId}`}
                      type="date"
                      value={item.expiration_date}
                      onChange={e =>
                        handleFieldChange(item.tempId, "expiration_date", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`notes-${item.tempId}`}>Notes</Label>
                    <Textarea
                      id={`notes-${item.tempId}`}
                      value={item.notes}
                      onChange={e => handleFieldChange(item.tempId, "notes", e.target.value)}
                      placeholder="Additional notes or comments"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
          <Button type="button" variant="outline" onClick={handleAddAnother}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Chemical
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddInventoryForm
