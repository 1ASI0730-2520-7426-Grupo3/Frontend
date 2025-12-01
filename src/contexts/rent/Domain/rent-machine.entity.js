export class RentMachine {
  constructor({
    id = 0,
    name = '',
    type = '',
    model = '',
    price = 0,
    currency = 'USD',
    image = null,
    isAvailable = true,
  }) {
    this.id = id
    this.name = name
    this.type = type
    this.model = model
    this.price = Number(price)
    this.currency = currency
    this.image = image
    this.isAvailable = isAvailable
  }

  getFormattedPrice() {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: 0,
      }).format(this.price) + ' / month'
    )
  }
}
