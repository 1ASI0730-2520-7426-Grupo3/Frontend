import { MaintenanceRequest } from './maintenance-request.entity.js'

/**
 * Maintenance Assembler
 * Transforms data between API responses and Domain entities
 */
export class MaintenanceAssembler {
  /**
   * Convert API resource to MaintenanceRequest entity
   * @param {Object} resource - Raw request data from API
   * @returns {MaintenanceRequest}
   */
  static toEntityFromResource(resource) {
    return new MaintenanceRequest(resource)
  }

  /**
   * Convert array of API resources to MaintenanceRequest entities
   * @param {Array} resources - Array of request data from API
   * @returns {MaintenanceRequest[]}
   */
  static toEntityListFromResources(resources) {
    if (!Array.isArray(resources)) {
      return []
    }

    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Create a new maintenance request resource from form data
   * @param {Object} formData - Form data from UI
   * @returns {Object} - Resource ready for API
   */
  static toCreateResource(formData) {
    return {
      userId: formData.userId,
      equipmentId: formData.equipmentId,
      type: formData.type || 'corrective',
      status: 'pending',
      costUSD: formData.costUSD,
      selectedDate: formData.selectedDate,
      createdAt: new Date().toISOString(),
      notes: formData.notes || '',
      assignedTechnicianId: null
    }
  }

  /**
   * Transform equipment data to option for select dropdown
   * @param {Object} equipment - Equipment data
   * @returns {Object} - Option object {id, label}
   */
  static toEquipmentOption(equipment) {
    return {
      id: equipment.id,
      label: equipment.name || 'Unknown Equipment'
    }
  }

  /**
   * Transform equipment list to options
   * @param {Array} equipmentList - List of equipment
   * @returns {Array} - List of options
   */
  static toEquipmentOptions(equipmentList) {
    if (!Array.isArray(equipmentList)) {
      return []
    }

    return equipmentList.map(e => this.toEquipmentOption(e))
  }
}
