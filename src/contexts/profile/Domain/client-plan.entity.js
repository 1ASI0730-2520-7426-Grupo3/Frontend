/**
 * Client Plan Entity
 * Represents a subscription plan for clients
 */
export class ClientPlan {
  constructor({ id = 0, name = '', price = 0, billingCycle = 'monthly', maxMachines = 0, targetUserRole = 'Client' }) {
    this.id = id
    this.name = name
    this.price = price
    this.billingCycle = billingCycle
    this.maxMachines = maxMachines
    this.targetUserRole = targetUserRole
  }

  /**
   * Get formatted price with currency
   * @param {string} currency - Currency symbol (default: 'USD')
   * @returns {string}
   */
  getFormattedPrice(currency = 'USD') {
    return `$${this.price.toFixed(2)} ${currency} / ${this.billingCycle}`
  }

  /**
   * Get max machines display text
   * @returns {string}
   */
  getMaxMachinesText() {
    const isProvider = this.targetUserRole === 'Provider'
    const unit = isProvider ? 'clients' : 'machines'

    if (this.maxMachines >= 999) {
      return `Unlimited ${unit}`
    }
    return `Up to ${this.maxMachines} ${unit}`
  }

  /**
   * Check if this is the basic plan
   * @returns {boolean}
   */
  isBasicPlan() {
    return this.name.toLowerCase() === 'basic'
  }

  /**
   * Check if this is the standard plan
   * @returns {boolean}
   */
  isStandardPlan() {
    return this.name.toLowerCase() === 'standard'
  }

  /**
   * Check if this is the premium plan
   * @returns {boolean}
   */
  isPremiumPlan() {
    return this.name.toLowerCase() === 'premium'
  }
}
