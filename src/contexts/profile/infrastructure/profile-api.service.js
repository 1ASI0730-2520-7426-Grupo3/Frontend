import { http } from '@/shared-kernel/infrastructure/http'
import { ProfileAssembler } from '../Domain/profile.assembler.js'

/**
 * Profile API Service
 * Handles user profile and plan-related API calls
 */
export class ProfileApiService {
  /**
   * Get user profile with current plan
   * @param {number} userId - User ID
   * @returns {Promise<UserProfile>}
   */
  async getUserProfile(userId) {
    // eslint-disable-next-line no-useless-catch
    try {
      // Fetch user data
      const userResponse = await http.get(`/users/${userId}`)
      const userData = userResponse.data

      // Fetch user's current plan if they have one
      let planData = null
      if (userData.clientPlanId) {
        const planResponse = await http.get(`/clientPlans/${userData.clientPlanId}`)
        planData = planResponse.data
      }

      // Convert to domain entity
      return ProfileAssembler.toUserProfileEntity(userData, planData)
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all available client plans
   * @returns {Promise<Array<ClientPlan>>}
   */
  async getAllPlans() {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await http.get('/clientPlans')
      return ProfileAssembler.toPlansArray(response.data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Update user's plan
   * @param {number} userId - User ID
   * @param {number} planId - New plan ID
   * @returns {Promise<UserProfile>}
   */
  async updateUserPlan(userId, planId) {
    // eslint-disable-next-line no-useless-catch
    try {
      // Update user's plan
      await http.patch(`/users/${userId}`, {
        clientPlanId: planId,
      })

      // Return updated profile
      return this.getUserProfile(userId)
    } catch (error) {
      throw error
    }
  }

  /**
   * Update user's profile photo
   * @param {number} userId - User ID
   * @param {string} photoUrl - Photo URL or base64 data
   * @returns {Promise<void>}
   */
  async updateProfilePhoto(userId, photoUrl) {
    // eslint-disable-next-line no-useless-catch
    try {
      await http.patch(`/users/${userId}`, {
        profilePhoto: photoUrl,
      })
    } catch (error) {
      throw error
    }
  }
}
