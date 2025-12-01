export class BillingInvoice {
  constructor({
    id = 0,
    userId = 0,
    companyName = '',
    amount = 0,
    currency = 'USD',
    status = 'pending',
    issuedAt = '',
    paidAt = null,
  }) {
    this.id = id
    this.userId = userId
    this.companyName = companyName
    this.amount = Number(amount)
    this.currency = currency
    this.status = status
    this.issuedAt = issuedAt
    this.paidAt = paidAt
  }

  /**
   * Formatea el monto usando la moneda USD
   */
  getFormattedAmount() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(this.amount)
  }

  isPaid() {
    return this.status.toLowerCase() === 'paid'
  }

  isPending() {
    return this.status.toLowerCase() === 'pending'
  }
}
