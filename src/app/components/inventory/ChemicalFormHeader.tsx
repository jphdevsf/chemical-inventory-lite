import { ArrowLeft } from "lucide-react"
import { Button } from "@/app/components/elements/Button"

interface ChemicalFormHeaderProps {
  title: string
  subtitle?: string
  onBack: () => void
}

export const ChemicalFormHeader = ({ title, subtitle, onBack }: ChemicalFormHeaderProps) => {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to List
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl mb-1">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  )
}
