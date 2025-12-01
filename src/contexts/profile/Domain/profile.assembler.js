import { UserProfile } from './user-profile.entity.js'
import { ClientPlan } from './client-plan.entity.js'

/**
 * Profile Assembler
 * Transforms data between API resources and domain entities
 */
export class ProfileAssembler {
  /**
   * Convert API resource to ClientPlan entity
   * @param {Object} resource - API resource
   * @returns {ClientPlan}
   */
  static toPlanEntity(resource) {
    return new ClientPlan({
      id: resource.id,
      name: resource.name,
      price: resource.price,
      billingCycle: resource.billingCycle,
      maxMachines: resource.maxMachines,
    })
  }

  /**
   * Convert API resource to UserProfile entity
   * @param {Object} resource - User API resource
   * @param {Object} planResource - Plan API resource (optional)
   * @returns {UserProfile}
   */
  static toUserProfileEntity(resource, planResource = null) {
    return new UserProfile({
      id: resource.id,
      name: resource.name,
      email: resource.email,
      username: resource.username,
      phone: resource.phone,
      type: resource.type,
      clientPlanId: resource.clientPlanId,
      currentPlan: planResource ? this.toPlanEntity(planResource) : null,
    })
  }

  /**
   * Convert array of plan resources to plan entities
   * @param {Array} resources - Array of plan API resources
   * @returns {Array<ClientPlan>}
   */
  static toPlansArray(resources) {
    return resources.map((resource) => this.toPlanEntity(resource))
  }
}
