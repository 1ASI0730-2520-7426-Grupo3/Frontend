import { http } from '@/shared-kernel/infrastructure/http'
import { InvoiceAssembler } from '../Domain/invoice.assembler.js'

export class AccountStatementApiService {
  async getInvoicesByUser(userId) {
    const response = await http.get(`/billing/invoices?userId=${userId}`)

    return InvoiceAssembler.toEntityList(response.data)
  }

  async markAsPaid(id) {
    // Send current datetime in ISO format (yyyy-MM-ddTHH:mm:ss)
    const now = new Date()
    const paidAt = now.toISOString().split('.')[0] // Remove milliseconds

    const payload = { paidAt }
    const response = await http.put(`/billing/invoices/${id}/pay`, payload)

    return InvoiceAssembler.toEntity(response.data)
  }
}
