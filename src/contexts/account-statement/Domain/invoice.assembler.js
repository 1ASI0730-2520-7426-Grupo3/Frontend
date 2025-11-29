import { BillingInvoice } from './invoice.entity.js'

export class InvoiceAssembler {
  static toEntity(resource) {
    return new BillingInvoice({
      id: resource.id,
      userId: resource.userId,
      companyName: resource.companyName,
      amount: resource.amount,
      currency: resource.currency,
      status: resource.status,
      issuedAt: resource.issuedAt,
      paidAt: resource.paidAt,
    })
  }

  static toEntityList(resources) {
    if (!Array.isArray(resources)) return []
    return resources.map((resource) => this.toEntity(resource))
  }
}
