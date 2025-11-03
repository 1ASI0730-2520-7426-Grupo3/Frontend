import { http } from '@/shared-kernel/infrastructure/http'

export class CompanyApiService {
  /**
   * Get all equipment for a specific company
   * @param {number} companyId
   * @returns {Promise<Array>}
   */
  async getCompanyEquipment(companyId) {
    try {
      // Get company-equipment relationships
      const companyMachinesResponse = await http.get('/companyMachines', {
        params: { companyId, active: true }
      })
      const companyMachines = companyMachinesResponse.data

      if (!companyMachines || companyMachines.length === 0) {
        return []
      }

      // Get equipment details for each machine
      const equipmentIds = companyMachines.map(cm => cm.equipmentId)
      const equipmentPromises = equipmentIds.map(id =>
        http.get(`/equipment/${id}`).then(res => res.data)
      )

      const equipment = await Promise.all(equipmentPromises)
      return equipment
    } catch (error) {
      console.error('Error fetching company equipment:', error)
      throw error
    }
  }

  /**
   * Get all maintenance requests for a company's equipment
   * @param {number} companyId
   * @returns {Promise<Array>}
   */
  async getCompanyMaintenanceRequests(companyId) {
    try {
      // First get all equipment for this company
      const equipment = await this.getCompanyEquipment(companyId)
      const equipmentIds = equipment.map(e => e.id)

      if (equipmentIds.length === 0) {
        return []
      }

      // Get all maintenance requests for these equipment
      const maintenanceResponse = await http.get('/maintenanceRequests')
      const allRequests = maintenanceResponse.data

      // Filter requests that belong to this company's equipment
      const companyRequests = allRequests.filter(req =>
        equipmentIds.includes(req.equipmentId)
      )

      // Enrich each request with equipment and user data
      const enrichedRequests = await Promise.all(
        companyRequests.map(async (req) => {
          const equipmentData = equipment.find(e => e.id === req.equipmentId)

          // Get user data for the client who made the request
          let userData = null
          try {
            const userResponse = await http.get(`/users/${req.userId}`)
            userData = userResponse.data
          } catch (err) {
            console.warn(`Could not fetch user ${req.userId}:`, err)
          }

          return {
            ...req,
            equipment: equipmentData,
            client: userData
          }
        })
      )

      return enrichedRequests
    } catch (error) {
      console.error('Error fetching company maintenance requests:', error)
      throw error
    }
  }
}
