import { Save } from "lucide-react"
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
import { ChemicalDeleteDialog } from "@/app/components/inventory/ChemicalDeleteDialog"
import { FormHeader } from "@/app/components/inventory/FormHeader"
import { InventoryFormFields } from "@/app/components/inventory/form/InventoryFormFields"
import { VALIDATION_MESSAGES } from "@/app/components/inventory/validation"
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
      toast.error(VALIDATION_MESSAGES.required)
      return
    }
    onUpdate(formData)
  }

  const handleDelete = () => {
    onDelete(item.id)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <FormHeader title={`Editing ${item.chemical_name}`} subtitle={`ID: ${item.id}`} />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chemical Details</CardTitle>
            <CardDescription>
              Added on {new Date(item.date_added).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryFormFields formData={formData} onChange={handleFieldChange} />
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
