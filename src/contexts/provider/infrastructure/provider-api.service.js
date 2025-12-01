import { http } from '@/shared-kernel/infrastructure/http'

/**
 * Provider API Service
 * Handles provider-specific operations like viewing rental requests, maintenance requests, etc.
 */
export class ProviderApiService {
  /**
   * Get all pending rental requests (for provider dashboard)
   * @returns {Promise<Array>}
   */
  async getPendingRentalRequests() {
    try {
      const response = await http.get('/rentalRequests')
      // Filter only pending requests
      return response.data.filter((request) => request.status === 'pending')
    } catch (error) {
      console.error('Error fetching rental requests:', error)
      return []
    }
  }

  /**
   * Approve a rental request
   * @param {number} requestId - Rental request ID
   * @returns {Promise<Object>}
   */
  async approveRentalRequest(requestId) {
    const response = await http.post(`/rentalRequests/${requestId}/approve`)
    return response.data
  }

  /**
   * Reject a rental request
   * @param {number} requestId - Rental request ID
   * @returns {Promise<Object>}
   */
  async rejectRentalRequest(requestId) {
    const response = await http.put(`/rentalRequests/${requestId}`, {
      status: 'rejected',
    })
    return response.data
  }

  /**
   * Get all maintenance requests
   * @returns {Promise<Array>}
   */
  async getAllMaintenanceRequests() {
    try {
      const response = await http.get('/maintenanceRequests')
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      return []
    }
  }

  /**
   * Get provider's equipment
   * @returns {Promise<Array>}
   */
  async getProviderEquipment() {
    try {
      const response = await http.get('/equipments')
      return response.data
    } catch (error) {
      console.error('Error fetching equipment:', error)
      return []
    }
  }

  /**
   * Get all invoices (for provider billing view)
   * @returns {Promise<Array>}
   */
  async getAllInvoices() {
    try {
      const response = await http.get('/billing/invoices/all')
      return response.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  /**
   * Get all rental requests (approved and pending) for provider
   * @returns {Promise<Array>}
   */
  async getAllRentalRequests() {
    try {
      const response = await http.get('/rentalRequests')
      return response.data
    } catch (error) {
      console.error('Error fetching all rental requests:', error)
      return []
    }
  }

  /**
   * Get clients who have rental requests with this provider
   * @returns {Promise<Array>}
   */
  async getMyClients() {
    try {
      const providerId = parseInt(localStorage.getItem('userId'))
      const response = await http.get('/rentalRequests')

      // Filter approved requests for this provider and extract unique clients
      const approvedRequests = response.data.filter(
        (req) => req.status === 'approved' && req.providerId === providerId,
      )

      // Get unique clients
      const clientsMap = new Map()
      approvedRequests.forEach((req) => {
        if (!clientsMap.has(req.clientId)) {
          clientsMap.set(req.clientId, {
            id: req.clientId,
            email: req.clientEmail || `Client #${req.clientId}`,
            date: new Date(req.updatedDate).toLocaleDateString('en-GB'),
          })
        }
      })

      return Array.from(clientsMap.values())
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  }
}
