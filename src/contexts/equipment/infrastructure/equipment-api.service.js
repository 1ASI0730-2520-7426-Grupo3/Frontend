import { http } from '@/shared-kernel/infrastructure/http'
import { EquipmentAssembler } from '../Domain/equipment.assembler.js'

/**
 * Equipment API Service
 * Handles HTTP communication for equipment operations
 */
export class EquipmentApiService {
  /**
   * Create new equipment
   * @param {Object} equipmentData - Equipment data to create
   * @returns {Promise<Equipment>}
   */
  async createEquipment(equipmentData) {
    const response = await http.post('/equipments', equipmentData)
    return EquipmentAssembler.toEntity(response.data)
  }

  /**
   * Get equipment by ID
   * @param {number} id - Equipment ID
   * @returns {Promise<Equipment>}
   */
  async getEquipmentById(id) {
    const response = await http.get(`/equipments/${id}`)
    return EquipmentAssembler.toEntity(response.data)
  }

  /**
   * Get all equipment for a client
   * @param {number} clientId - Client ID
   * @returns {Promise<Equipment[]>}
   */
  async getClientEquipment(clientId) {
    const response = await http.get(`/equipments?clientId=${clientId}`)
    return EquipmentAssembler.toEntityList(response.data)
  }

  /**
   * Update equipment
   * @param {number} id - Equipment ID
   * @param {Object} equipmentData - Updated equipment data
   * @returns {Promise<Equipment>}
   */
  async updateEquipment(id, equipmentData) {
    const response = await http.put(`/equipments/${id}`, equipmentData)
    return EquipmentAssembler.toEntity(response.data)
  }

  /**
   * Delete equipment
   * @param {number} id - Equipment ID
   * @returns {Promise<void>}
   */
  async deleteEquipment(id) {
    await http.delete(`/equipments/${id}`)
  }
}
