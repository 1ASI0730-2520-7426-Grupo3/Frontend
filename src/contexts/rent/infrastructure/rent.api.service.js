import { http } from '@/shared-kernel/infrastructure/http'
import { RentAssembler } from '../Domain/rent.assembler.js'

export class RentApiService {
  async getRentalCatalog() {
    try {
      const response = await http.get('/rentals')
      return RentAssembler.toEntityList(response.data)
    } catch (err) {
      console.warn('Using mock data for rentals.', err)

      // DATOS MOCK (Simulados)
      const mockData = [
        {
          id: 1,
          equipmentName: 'Treadmill Pro X',
          type: 'treadmill',
          model: 'TRX-300',
          monthlyPriceUSD: 200,
          currency: 'USD',
          imageUrl: '/treadmill-pro-x.png',
          isAvailable: true,
        },
        {
          id: 2,
          equipmentName: 'Stationary Bike GX',
          type: 'bike',
          model: 'SB-GX',
          monthlyPriceUSD: 99,
          currency: 'USD',
          imageUrl: '/stationary-bike-gx.png',
          isAvailable: true,
        },
        {
          id: 3,
          equipmentName: 'Rowing Machine R-300',
          type: 'rower',
          model: 'R-300',
          monthlyPriceUSD: 150,
          currency: 'USD',
          imageUrl: '/rowing-r300.jpg',
          isAvailable: true,
        },
      ]
      return RentAssembler.toEntityList(mockData)
    }
  }
}
