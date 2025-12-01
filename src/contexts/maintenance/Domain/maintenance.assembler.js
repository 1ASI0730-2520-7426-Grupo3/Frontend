import { MaintenanceRequest } from './maintenance-request.entity.js'

export class MaintenanceAssembler {
  static toEntityFromResource(resource) {
    return new MaintenanceRequest(resource)
  }

  static toEntityListFromResources(resources) {
    if (!Array.isArray(resources)) return []
    return resources.map((resource) => this.toEntityFromResource(resource))
  }

  /**
   * Convierte los datos del formulario al formato EXACTO que espera el Backend .NET
   * Recurso: CreateMaintenanceRequestResource
   */
  static toCreateResource(formData) {
    return {
      // Backend espera 'equipmentId' (int)
      equipmentId: Number(formData.equipmentId),

      // Backend espera 'selectedDate' (DateTime)
      // Aseguramos formato ISO
      selectedDate: formData.selectedDate
        ? new Date(formData.selectedDate).toISOString()
        : new Date().toISOString(),

      // Backend espera 'observation' (string). Mapeamos 'notes' a 'observation'
      observation: formData.notes || 'No observations provided',
    }
  }

  static toEquipmentOption(equipment) {
    return {
      id: equipment.id,
      label: equipment.name || 'Unknown Equipment',
    }
  }

  static toEquipmentOptions(equipmentList) {
    if (!Array.isArray(equipmentList)) return []
    return equipmentList.map((e) => this.toEquipmentOption(e))
  }
}
