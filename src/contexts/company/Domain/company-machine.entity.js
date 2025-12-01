/**
 * CompanyMachine Entity
 * Represents a machine/equipment that belongs to a company
 * This is the domain model for the company context
 */
export class CompanyMachine {
  constructor({ id = 0, name = '', model = '', image = null }) {
    this.id = id
    this.name = name
    this.model = model
    this.image = image
  }

  /**
   * Check if the machine has a valid image
   * @returns {boolean}
   */
  hasImage() {
    return Boolean(this.image)
  }

  /**
   * Get display name (name + model)
   * @returns {string}
   */
  getDisplayName() {
    return `${this.name} (${this.model})`
  }
}
