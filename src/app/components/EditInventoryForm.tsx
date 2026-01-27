import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/app/components/elements/AlertDialog"
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
    onUpdate(formData)
  }

  const handleDelete = () => {
    onDelete(item.id)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl mb-1">Edit Chemical</h1>
          <p className="text-gray-600">ID: {item.id}</p>
        </div>
      </div>

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
              <div className="space-y-2">
                <Label htmlFor="chemical_name">
                  Chemical Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="chemical_name"
                  value={formData.chemical_name}
                  onChange={e => handleFieldChange("chemical_name", e.target.value)}
                  placeholder="e.g., Sodium Chloride"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cid_number">CID Number</Label>
                <Input
                  id="cid_number"
                  value={formData.cid_number}
                  onChange={e => handleFieldChange("cid_number", e.target.value)}
                  placeholder="e.g., 7647-14-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={e => handleFieldChange("quantity", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

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
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => handleFieldChange("location", e.target.value)}
                  placeholder="e.g., Cabinet A, Shelf 2"
                />
              </div>

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
                <Label htmlFor="name">Supplier</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleFieldChange("name", e.target.value)}
                  placeholder="e.g., Sigma-Aldrich"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot_number">Lot Number</Label>
                <Input
                  id="lot_number"
                  value={formData.lot_number}
                  onChange={e => handleFieldChange("lot_number", e.target.value)}
                  placeholder="e.g., LOT12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration_date">Expiration Date</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={e => handleFieldChange("expiration_date", e.target.value)}
                />
              </div>

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {item.chemical_name} from your inventory. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditInventoryForm
