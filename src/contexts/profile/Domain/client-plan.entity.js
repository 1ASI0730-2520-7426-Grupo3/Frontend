/**
 * Client Plan Entity
 * Represents a subscription plan for clients
 */
export class ClientPlan {
  constructor({ id = 0, name = '', price = 0, billingCycle = 'monthly', maxMachines = 0 }) {
    this.id = id
    this.name = name
    this.price = price
    this.billingCycle = billingCycle
    this.maxMachines = maxMachines
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
    return `Up to ${this.maxMachines} machines`
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
