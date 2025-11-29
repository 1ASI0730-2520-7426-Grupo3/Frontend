/**
 * MaintenanceRequest Entity
 * Represents a maintenance request in the domain
 */
export class MaintenanceRequest {
  constructor({
    id = null,
    userId = 0,
    equipmentId = 0,
    type = 'corrective',
    status = 'pending',
    costUSD = 0,
    selectedDate = '',
    createdAt = '',
    notes = '',
    assignedTechnicianId = null,
  }) {
    this.id = id
    this.userId = userId
    this.equipmentId = equipmentId
    this.type = type
    this.status = status
    this.costUSD = costUSD
    this.selectedDate = selectedDate
    this.createdAt = createdAt
    this.notes = notes
    this.assignedTechnicianId = assignedTechnicianId
  }

  /**
   * Check if request is pending
   * @returns {boolean}
   */
  isPending() {
    return this.status === 'pending'
  }

  /**
   * Check if request is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.status === 'completed'
  }

  /**
   * Check if request has a technician assigned
   * @returns {boolean}
   */
  hasTechnician() {
    return this.assignedTechnicianId !== null
  }

  /**
   * Get formatted cost
   * @returns {string}
   */
  getFormattedCost() {
    return `$${this.costUSD.toFixed(2)}`
  }
}
