/**
 * User Profile Entity
 * Represents a user's profile information including their subscription plan
 */
export class UserProfile {
  constructor({
    id = 0,
    name = '',
    email = '',
    username = '',
    phone = '',
    type = 'individual',
    clientPlanId = null,
    currentPlan = null,
    profilePhoto = null,
  }) {
    this.id = id
    this.name = name
    this.email = email
    this.username = username
    this.phone = phone
    this.type = type
    this.clientPlanId = clientPlanId
    this.currentPlan = currentPlan // ClientPlan entity
    this.profilePhoto = profilePhoto
  }

  /**
   * Get display name
   * @returns {string}
   */
  getDisplayName() {
    return this.name || this.username || this.email
  }

  /**
   * Get current plan type display
   * @returns {string}
   */
  getCurrentPlanType() {
    if (!this.currentPlan) return 'No plan'
    return `${this.currentPlan.name} (${this.currentPlan.getMaxMachinesText()})`
  }

  /**
   * Check if user has an active plan
   * @returns {boolean}
   */
  hasActivePlan() {
    return Boolean(this.currentPlan)
  }

  /**
   * Check if user is on a specific plan
   * @param {number} planId - Plan ID to check
   * @returns {boolean}
   */
  isOnPlan(planId) {
    return this.clientPlanId === planId
  }

  /**
   * Check if user has a profile photo
   * @returns {boolean}
   */
  hasProfilePhoto() {
    return Boolean(this.profilePhoto)
  }
}
