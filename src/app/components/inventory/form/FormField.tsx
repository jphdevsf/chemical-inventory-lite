import { Input } from "@/app/components/elements/Input"
import { Label } from "@/app/components/elements/Label"

interface FormFieldProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string | number) => void
  type?: "text" | "number" | "date"
  step?: string
  placeholder?: string
  required?: boolean
  requiredMarker?: boolean
}

export const FormField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  required = false,
  requiredMarker = false
}: FormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      onChange(parseFloat(e.target.value) || 0)
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {requiredMarker && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        step={step}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}
