import { http } from '@/shared-kernel/infrastructure/http'
import { InvoiceAssembler } from '../Domain/invoice.assembler.js' // <--- Importar

export class AccountStatementApiService {
  async getInvoicesByUser(userId) {
    const response = await http.get(`/billing/invoices?userId=${userId}`)
    // Usar el Assembler para convertir JSON a Entidades
    return InvoiceAssembler.toEntityList(response.data)
  }

  async markAsPaid(id) {
    const payload = {
      paidAt: new Date().toISOString().split('T')[0],
    }
    const response = await http.put(`/billing/invoices/${id}/pay`, payload)
    // Devolver la entidad actualizada
    return InvoiceAssembler.toEntity(response.data)
  }
}
