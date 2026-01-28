export const UNITS = [
  { value: "g", label: "g (grams)" },
  { value: "kg", label: "kg (kilograms)" },
  { value: "mg", label: "mg (milligrams)" },
  { value: "mL", label: "mL (milliliters)" },
  { value: "L", label: "L (liters)" },
  { value: "units", label: "units" }
] as const

export const HAZARD_CLASSES = [
  { value: "Non-Hazardous", label: "Non-Hazardous" },
  { value: "Flammable", label: "Flammable" },
  { value: "Corrosive", label: "Corrosive" },
  { value: "Toxic", label: "Toxic" },
  { value: "Oxidizer", label: "Oxidizer" },
  { value: "Reactive", label: "Reactive" },
  { value: "Carcinogen", label: "Carcinogen" }
] as const
