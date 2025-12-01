import { RentMachine } from './rent-machine.entity.js'

export class RentAssembler {
  static toEntity(resource) {
    return new RentMachine({
      id: resource.id,
      name: resource.equipmentName || resource.name,
      type: resource.type,
      model: resource.model,
      price: resource.monthlyPriceUSD || resource.price,
      currency: resource.currency || 'USD',
      image: resource.imageUrl || resource.image,
      isAvailable: resource.isAvailable ?? true,
    })
  }

  static toEntityList(resources) {
    if (!Array.isArray(resources)) return []
    return resources.map((resource) => this.toEntity(resource))
  }
}
