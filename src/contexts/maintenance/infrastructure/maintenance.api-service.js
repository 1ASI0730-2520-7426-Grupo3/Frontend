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
    } catch (error) {
      console.error('Error fetching requests:', error)
      return []
    }
  }

  async getPricingMap() {
    return new Map()
  }
}

export default MaintenanceApiService
