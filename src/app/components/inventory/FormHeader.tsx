interface FormHeaderProps {
  title: string
  subtitle?: string
}

export const FormHeader = ({ title, subtitle }: FormHeaderProps) => {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex-1">
        <h1 className="text-3xl mb-1">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  )
}
