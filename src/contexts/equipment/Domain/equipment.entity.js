/**
 * Equipment Entity
 * Represents gym equipment/machine for client management
 * Domain model for the equipment context
 */
export class Equipment {
  constructor({
    id = 0,
    name = '',
    type = '',
    model = '',
    manufacturer = '',
    serialNumber = '',
    code = '',
    installationDate = null,
    energyConsumption = '',
    location = '',
    address = '',
    usageHours = 0,
    status = 'active',
    clientId = null,
  }) {
    this.id = id
    this.name = name
    this.type = type
    this.model = model
    this.manufacturer = manufacturer
    this.serialNumber = serialNumber
    this.code = code
    this.installationDate = installationDate
    this.energyConsumption = energyConsumption
    this.location = location
    this.address = address
    this.usageHours = usageHours
    this.status = status
    this.clientId = clientId
  }

  /**
   * Get full equipment identifier
   * @returns {string}
   */
  getFullIdentifier() {
    return `${this.name} - ${this.model} (${this.code})`
  }

  /**
   * Check if equipment is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active'
  }

  /**
   * Get formatted installation date
   * @returns {string}
   */
  getFormattedInstallationDate() {
    if (!this.installationDate) return 'N/A'
    return new Date(this.installationDate).toLocaleDateString()
  }

  /**
   * Check if equipment data is complete
   * @returns {boolean}
   */
  isComplete() {
    return Boolean(
      this.name &&
      this.type &&
      this.model &&
      this.manufacturer &&
      this.serialNumber &&
      this.code
    )
  }
}
