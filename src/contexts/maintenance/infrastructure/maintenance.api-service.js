import { http } from '@/shared-kernel/infrastructure/http'
import { MaintenanceAssembler } from '../Domain/maintenance.assembler.js'

export class MaintenanceApiService {
  /**
   * Obtiene la lista de equipos disponibles para mantenimiento.
   */
  async getUserEquipments() {
    const response = await http.get('/equipments')
    return response.data
  }

  /**
   * Crea una nueva solicitud de mantenimiento.
   */
  async createRequest(payload) {
    const response = await http.post('/maintenanceRequests', payload)
    return response.data
  }

  /**
   * (NUEVO) Obtiene todas las solicitudes de mantenimiento.
   * Útil para el Dashboard.
   */
  async getAllRequests() {
    try {
      const response = await http.get('/maintenanceRequests')
      // Usamos el assembler para convertir a entidades si es necesario,
      // o devolvemos la data directa si solo vamos a contar.
      // Por consistencia, devolvemos la data cruda o mapeada.
      // Aquí asumiremos que MaintenanceAssembler tiene un toEntityListFromResources
      // Si no lo tiene, devolvemos response.data directamente.
      return MaintenanceAssembler.toEntityListFromResources(response.data)
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return []
    }
  }

  async getPricingMap() {
    return new Map()
  }

  /**
   * Assigns a maintenance request to a provider (or self if no providerId specified).
   */
  async assignMaintenanceRequest(maintenanceRequestId, providerId = null) {
    const response = await http.put(`/maintenanceRequests/${maintenanceRequestId}/assign`, {
      providerId: providerId
    })
    return response.data
  }

  /**
   * Updates the status of a maintenance request (e.g., mark as completed).
   */
  async updateMaintenanceRequestStatus(maintenanceRequestId, status) {
    const response = await http.put(`/maintenanceRequests/${maintenanceRequestId}`, {
      status: status
    })
    return response.data
  }
}

export default MaintenanceApiService
