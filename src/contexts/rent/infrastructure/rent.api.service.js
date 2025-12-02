import { http } from '@/shared-kernel/infrastructure/http'
import { RentAssembler } from '../Domain/rent.assembler.js'
import i18n from '@/shared-kernel/infrastructure/i18n'

export class RentApiService {
  /**
   * Get rental catalog from equipment available for rent
   * @returns {Promise<RentMachine[]>}
   */
  async getRentalCatalog() {
    try {
      const response = await http.get('/equipments')
      const rentData = response.data.map((equipment) => ({
        id: equipment.id,
        name: equipment.name,
        type: equipment.type,
        model: equipment.model || 'Standard',
        price: this._calculateMonthlyPrice(equipment.type),
        currency: 'USD',
        image: equipment.image,
        isAvailable: equipment.status === 'active',
      }))
      return RentAssembler.toEntityList(rentData)
    } catch (err) {
      console.error('Error fetching rental catalog:', err)
      throw err
    }
  }

  /**
   * Create a rental request for specific equipment
   * @param {number} equipmentId - Equipment ID
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>}
   */
  async createRentalRequest(equipmentId, clientId) {
    const monthlyPrice = this._calculateMonthlyPrice('default')
    const payload = {
      equipmentId,
      clientId,
      monthlyPrice,
      notes: `Rental request for equipment ${equipmentId}`,
    }
    const response = await http.post('/rentalRequests', payload)
    return response.data
  }

  /**
   * Get rental requests by client ID
   * @param {number} clientId - Client ID
   * @returns {Promise<Object[]>}
   */
  async getRentalRequestsByClientId(clientId) {
    const response = await http.get(`/rentalRequests/client/${clientId}`)
    return response.data
  }

  /**
   * Calculate monthly price based on equipment type
   * @private
   */
  _calculateMonthlyPrice(type) {
    const priceMap = {
      treadmill: 200,
      bike: 99,
      rower: 200,
      elliptical: 99,
      default: 150,
    }
    return priceMap[type?.toLowerCase()] || priceMap.default
  }
}
