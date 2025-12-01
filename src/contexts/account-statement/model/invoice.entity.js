export function formatCurrencyByRole(value) {
  if (typeof value !== 'number') return value ?? '';

  // Always use USD
  return `$ ${value.toFixed(2)}`
}

// Keep old function for backwards compatibility but make it use the new one
export function formatCurrencyPEN(value) {
  return formatCurrencyByRole(value);
}

export function isPaid(inv) { return inv?.status === 'paid'; }
export function isPending(inv) { return inv?.status === 'pending'; }
