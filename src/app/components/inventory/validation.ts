export const REQUIRED_FIELDS = ["chemical_name", "quantity", "unit", "expiration_date"] as const

export const VALIDATION_MESSAGES = {
  required: "Chemical name, Quantity, Unit, and Expiration Date are required"
}
