import { http } from './http'

/**
 * Service for user-related API operations.
 * Handles fetching user information across all contexts.
 */
export class UserApiService {
  /**
   * Get user by ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    const response = await http.get(`/users/${userId}`)
    return response.data
  }

  /**
   * Get multiple users by IDs
   * @param {number[]} userIds - Array of user IDs
   * @returns {Promise<Map<number, Object>>} Map of userId to user data
   */
  async getUsersByIds(userIds) {
    const uniqueIds = [...new Set(userIds)]
    const userMap = new Map()

    // Fetch all users in parallel
    const promises = uniqueIds.map(async (userId) => {
      try {
        const user = await this.getUserById(userId)
        userMap.set(userId, user)
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error)
      }
    })

    await Promise.all(promises)
    return userMap
  }

  /**
   * Get provider name by ID (convenience method)
   * @param {number} providerId - The provider user ID
   * @returns {Promise<string|null>} Provider name or null if not found
   */
  async getProviderName(providerId) {
    try {
      const user = await this.getUserById(providerId)
      return user.name || user.username
    } catch (error) {
      console.error(`Failed to fetch provider ${providerId}:`, error)
      return null
    }
  }
}

export default UserApiService
