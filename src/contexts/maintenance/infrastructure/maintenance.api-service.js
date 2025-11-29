// src/infrastructure/maintenance.api-service.js
const API = 'http://localhost:3000'

/** Fetch con error detallado y status en el objeto Error */
async function http(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let body = ''
    try {
      body = await res.text()
    } catch {}
    const err = new Error(`${res.status} ${res.statusText} @ ${url}${body ? ` :: ${body}` : ''}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/** QS helper: soporta arrays (id=1&id=2...) */
function qs(params = {}) {
  const parts = []
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue
    if (Array.isArray(v))
      v.forEach((val) => parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(val)}`))
    else parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

export class MaintenanceApiService {
  constructor(baseUrl = API) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  /**
   * Join en 2 pasos con fallbacks:
   * 1) /userMachines?userId=&active=true  (si falla => /userMachines?userId=)
   * 2) /equipments?id=...                 (si falla => /equipments y filtra en memoria)
   * Devuelve equipos + metadatos del vínculo (ownershipShare, permissions, linkId).
   */
  async getUserEquipments(userId) {
    // Paso 1: vínculos user<->machine
    let links = []
    const urlActive = `${this.baseUrl}/userMachines${qs({ userId, active: true })}`
    try {
      links = await http(urlActive)
    } catch (e) {
      console.warn('[MaintenanceApiService] Fallback links sin active=true:', e.message)
      const urlNoActive = `${this.baseUrl}/userMachines${qs({ userId })}`
      links = await http(urlNoActive) // si esto falla, dejamos que explote
    }

    if (!links.length) return []

    // Paso 2: equipos por ids (batch)
    const ids = [...new Set(links.map((l) => l.equipmentId))]
    let equipments = []
    const urlByIds = `${this.baseUrl}/equipments${qs({ id: ids })}`
    try {
      equipments = await http(urlByIds)
    } catch (e) {
      console.warn('[MaintenanceApiService] Fallback equipments: traer todos y filtrar:', e.message)
      const urlAll = `${this.baseUrl}/equipments`
      const all = await http(urlAll)
      equipments = all.filter((e) => ids.includes(e.id))
    }

    // Merge: equipo + datos del vínculo
    const linkByEquipId = new Map(links.map((l) => [l.equipmentId, l]))
    return equipments
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((e) => {
        const link = linkByEquipId.get(e.id) || {}
        return {
          ...e,
          linkId: link.id,
          ownershipShare: link.ownershipShare,
          permissions: link.permissions,
        }
      })
  }

  /** Map<equipmentId, fixedCostUSD> */
  async getPricingMap() {
    const url = `${this.baseUrl}/maintenancePricing`
    const rows = await http(url)
    const map = new Map()
    rows.forEach((r) => map.set(Number(r.equipmentId), r.fixedCostUSD ?? null))
    return map
  }

  /** Precio de un equipo (o null si no hay) */
  async getPricingFor(equipmentId) {
    const url = `${this.baseUrl}/maintenancePricing${qs({ equipmentId })}`
    const rows = await http(url)
    return rows.length ? (rows[0].fixedCostUSD ?? null) : null
  }

  /**
   * Crea una solicitud completando defaults e infiriendo costo si no se pasa.
   * payload: { userId, equipmentId, selectedDate (YYYY-MM-DD), type?, status?, costUSD?, notes?, assignedTechnicianId? }
   */
  async createRequest(payload) {
    const base = {
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    let finalCost = payload.costUSD
    if (finalCost == null && payload.equipmentId != null) {
      finalCost = await this.getPricingFor(Number(payload.equipmentId))
    }

    const body = { ...base, ...payload, costUSD: finalCost ?? null }
    const url = `${this.baseUrl}/maintenanceRequests`
    return http(url, { method: 'POST', body: JSON.stringify(body) })
  }

  /** Extras por si los usas en la vista */
  async getUserRequests(userId, opts = {}) {
    const { equipmentId, status, sortBy = 'createdAt', order = 'desc' } = opts
    const url = `${this.baseUrl}/maintenanceRequests${qs({ userId, equipmentId, status, _sort: sortBy, _order: order })}`
    return http(url)
  }

  async getEquipmentRequests(equipmentId, opts = {}) {
    const { status, sortBy = 'createdAt', order = 'desc' } = opts
    const url = `${this.baseUrl}/maintenanceRequests${qs({ equipmentId, status, _sort: sortBy, _order: order })}`
    return http(url)
  }
}

export default MaintenanceApiService
