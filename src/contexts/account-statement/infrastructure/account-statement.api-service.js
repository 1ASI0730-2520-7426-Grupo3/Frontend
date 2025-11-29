const API = 'http://localhost:3000'

async function http(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export class AccountStatementApiService {
  constructor(base = API) {
    this.base = base
  }

  async getInvoicesByUser(userId) {
    return http(`${this.base}/billingInvoices?userId=${userId}`)
  }

  async markAsPaid(id) {
    const payload = { status: 'paid', paidAt: new Date().toISOString().slice(0, 10) }
    return http(`${this.base}/billingInvoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }
}
