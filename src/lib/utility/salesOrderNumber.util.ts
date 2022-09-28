export const generateSONumber = (id: number | null) => {

  if (!id) {
    return 'New Sales Order'
  }

  const idString = id.toString()

  const numberDigits = idString.length

  const leadingZeros = '0'.repeat(6 - numberDigits)

  return `SO ${leadingZeros}${idString}`
}