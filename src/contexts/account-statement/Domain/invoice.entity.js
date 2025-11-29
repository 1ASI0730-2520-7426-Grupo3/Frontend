export function formatCurrencyPEN(value) {
  if (typeof value !== 'number') return value ?? ''
  return `S/. ${value.toFixed(2)}`
}

export function isPaid(inv) {
  return inv?.status === 'paid'
}
export function isPending(inv) {
  return inv?.status === 'pending'
}
