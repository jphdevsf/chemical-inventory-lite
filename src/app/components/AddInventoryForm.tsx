import { Plus, Save, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/app/components/elements/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/app/components/elements/Card"
import { InventoryFormFields } from "@/app/components/inventory/form/InventoryFormFields"
import { VALIDATION_MESSAGES } from "@/app/components/inventory/validation"
import type { ChemicalInventoryItem } from "@/app/types/inventory"
import { FormHeader } from "./inventory/FormHeader"

interface AddInventoryFormProps {
  onAdd: (items: ChemicalInventoryItem[]) => void
  onCancel: () => void
}

const emptyFormItem = (): ChemicalInventoryItem => ({
  id: crypto.randomUUID(),
  chemical_name: "",
  cid_number: "",
  quantity: 0,
  unit: "",
  location: "",
  hazard_class: "",
  name: "",
  lot_number: "",
  expiration_date: "",
  notes: "",
  date_added: new Date().toISOString()
})

const AddInventoryForm = ({ onAdd, onCancel }: AddInventoryFormProps) => {
  const [formItems, setFormItems] = useState<ChemicalInventoryItem[]>([emptyFormItem()])

  const handleFieldChange = (
    index: number,
    field: keyof ChemicalInventoryItem,
    value: string | number
  ) => {
    setFormItems(formItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least chemical name and quantity are filled
    const validItems = formItems.filter(
      item =>
        item.chemical_name.trim() !== "" &&
        item.quantity > 0 &&
        item.unit !== "" &&
        item.expiration_date !== ""
    )

    if (validItems.length === 0) {
      toast.error(VALIDATION_MESSAGES.required)
      return
    }

    const itemsToAdd = await Promise.all(
      validItems.map(async item => ({
        ...item,
        id: crypto.randomUUID(),
        date_added: new Date().toISOString()
      }))
    )

    onAdd(itemsToAdd)
  }

  const handleAddAnother = () => {
    setFormItems([...formItems, emptyFormItem()])
  }

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) return
    setFormItems(formItems.filter((_, i) => i !== index))
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <FormHeader
        title="Add Chemical Inventory"
        subtitle="Enter information for one or more chemicals"
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {formItems.map((item, index) => (
            <Card key={item.id}>
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
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <InventoryFormFields
                  formData={item}
                  onChange={(field, value) => handleFieldChange(index, field, value)}
                  idPrefix={`item-${item.id}`}
                />
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
