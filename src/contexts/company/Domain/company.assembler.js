import { CompanyMachine } from './company-machine.entity.js'

/**
 * Company Assembler
 * Transforms data between API responses and Domain entities
 */
export class CompanyAssembler {
  /**
   * Convert API equipment resource to CompanyMachine entity
   * @param {Object} resource - Raw equipment data from API
   * @returns {CompanyMachine}
   */
  static toEntityFromResource(resource) {
    return new CompanyMachine(resource)
  }

  /**
   * Convert array of API equipment resources to CompanyMachine entities
   * @param {Array} resources - Array of equipment data from API
   * @returns {CompanyMachine[]}
   */
  static toEntityListFromResources(resources) {
    if (!Array.isArray(resources)) {
      return []
    }

    return resources.map(resource => this.toEntityFromResource(resource))
  }
}
