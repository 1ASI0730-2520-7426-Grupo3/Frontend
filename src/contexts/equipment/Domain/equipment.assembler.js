import { Equipment } from './equipment.entity.js'

/**
 * Equipment Assembler
 * Transforms between DTOs and Equipment entities
 */
export class EquipmentAssembler {
  /**
   * Transform API resource to Equipment entity
   * @param {Object} resource - API response data
   * @returns {Equipment}
   */
  static toEntity(resource) {
    return new Equipment({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      model: resource.model,
      manufacturer: resource.manufacturer,
      serialNumber: resource.serialNumber || resource.serial_number,
      code: resource.code,
      installationDate: resource.installationDate || resource.installation_date,
      energyConsumption: resource.energyConsumption || resource.energy_consumption,
      location: resource.location,
      address: resource.address,
      usageHours: resource.usageHours || resource.usage_hours || 0,
      status: resource.status || 'active',
      clientId: resource.clientId || resource.client_id,
      image: resource.image,
    })
  }

  /**
   * Transform Equipment entity to API DTO
   * @param {Equipment} equipment - Equipment entity
   * @returns {Object}
   */
  static toDTO(equipment) {
    return {
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      manufacturer: equipment.manufacturer,
      serialNumber: equipment.serialNumber,
      code: equipment.code,
      installationDate: equipment.installationDate,
      energyConsumption: equipment.energyConsumption,
      location: equipment.location,
      address: equipment.address,
      usageHours: equipment.usageHours,
      status: equipment.status,
      clientId: equipment.clientId,
      image: equipment.image,
    }
  }

  /**
   * Transform array of resources to entities
   * @param {Array} resources - Array of API resources
   * @returns {Equipment[]}
   */
  static toEntityList(resources) {
    return resources.map((resource) => this.toEntity(resource))
  }
}
