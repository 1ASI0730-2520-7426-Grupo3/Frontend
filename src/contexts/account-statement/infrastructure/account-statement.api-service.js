import { http } from '@/shared-kernel/infrastructure/http'
import { InvoiceAssembler } from '../Domain/invoice.assembler.js'

export class AccountStatementApiService {
  async getInvoicesByUser(userId) {
    const response = await http.get(`/billing/invoices?userId=${userId}`)

    return InvoiceAssembler.toEntityList(response.data)
  }

  async markAsPaid(id) {
    const payload = {
      paidAt: new Date().toISOString().split('T')[0],
    }
    const response = await http.put(`/billing/invoices/${id}/pay`, payload)

    return InvoiceAssembler.toEntity(response.data)
  }
}
