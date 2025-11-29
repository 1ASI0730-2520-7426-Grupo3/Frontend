import { http } from '@/shared-kernel/infrastructure/http'

export class MaintenanceApiService {
  /**
   * Obtiene la lista de equipos disponibles para mantenimiento.
   * Usamos el endpoint real /equipments
   */
  async getUserEquipments() {
    // Nota: El backend actualmente devuelve todos los equipos.
    // En el futuro, podrías filtrar por usuario aquí o en el backend.
    const response = await http.get('/equipments')
    return response.data
  }

  /**
   * Envía la solicitud de mantenimiento al backend real.
   * Endpoint: POST /api/v1/maintenanceRequests
   */
  async createRequest(payload) {
    const response = await http.post('/maintenanceRequests', payload)
    return response.data
  }

  /**
   * Obtiene el historial de precios (Opcional/Simulado por ahora)
   * Como el backend aún no tiene endpoint de precios, devolvemos un mapa vacío
   * para que el formulario no falle.
   */
  async getPricingMap() {
    return new Map()
  }
}

export default MaintenanceApiService
