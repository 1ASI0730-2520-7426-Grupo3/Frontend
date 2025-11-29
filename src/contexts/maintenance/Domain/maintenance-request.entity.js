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
    observation = '', // <--- AGREGADO: Campo que viene del Backend
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

    // Mapeo inteligente: Usa 'observation' (Backend) si existe, si no usa 'notes'
    this.notes = observation || notes
    // Guardamos también la propiedad original por si acaso
    this.observation = this.notes

    this.assignedTechnicianId = assignedTechnicianId
  }

  /**
   * Check if request is pending
   * @returns {boolean}
   */
  isPending() {
    return String(this.status).toLowerCase() === 'pending'
  }

  /**
   * Check if request is completed
   * @returns {boolean}
   */
  isCompleted() {
    return String(this.status).toLowerCase() === 'completed'
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
    return `$${Number(this.costUSD).toFixed(2)}`
  }
}
