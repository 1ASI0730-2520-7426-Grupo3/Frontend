<script setup>
import { onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const API = 'http://localhost:3000'

async function http(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) {
    let body = ''; try { body = await res.text() } catch {}
    const err = new Error(`${res.status} ${res.statusText} @ ${url}${body ? ` :: ${body}` : ''}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

const moneyPEN = (v) => `S/ ${Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const todayISO = () => new Date().toISOString().slice(0, 10)

const router = useRouter()
const userId = 1

const state = reactive({
  loading: false,
  equipments: [],
  maintenanceRequests: [],
  invoices: [],
  usersMap: new Map(),
  error: '',
})

async function loadEquipments() {
  let links = []
  try { links = await http(`${API}/userMachines?userId=${userId}&active=true`) }
  catch { links = await http(`${API}/userMachines?userId=${userId}`) }
  if (!links.length) { state.equipments = []; return }

  const ids = [...new Set(links.map(l => l.equipmentId))]
  let equipments = []
  try {
    const qs = ids.map(id => `id=${id}`).join('&')
    equipments = await http(`${API}/equipments?${qs}`)
  } catch {
    const all = await http(`${API}/equipments`)
    equipments = all.filter(e => ids.includes(e.id))
  }

  const linkByEquipId = new Map(links.map(l => [l.equipmentId, l]))
  state.equipments = equipments
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map(e => {
      const link = linkByEquipId.get(e.id) || {}
      return { ...e, linkId: link.id, ownershipShare: link.ownershipShare, permissions: link.permissions }
    })
}

async function loadMaintenanceRequests() {
  state.maintenanceRequests = await http(`${API}/maintenanceRequests?userId=${userId}&_sort=createdAt&_order=desc`)
}

async function loadInvoices() {
  const rows = await http(`${API}/billingInvoices?userId=${userId}&_sort=issuedAt&_order=desc`)
  state.invoices = rows.map(r => ({ ...r, statusComputed: r.paidAt ? 'paid' : r.status }))
}

async function loadUsersMap() {
  const rows = await http(`${API}/users`)
  state.usersMap = new Map(rows.map(u => [u.id, u]))
}

async function loadAll() {
  state.loading = true; state.error = ''
  try { await Promise.all([loadEquipments(), loadMaintenanceRequests(), loadInvoices(), loadUsersMap()]) }
  catch (e) { console.error(e); state.error = e.message || 'Unexpected error' }
  finally { state.loading = false }
}

const equipmentCards = computed(() => state.equipments.map(e => ({ id: e.id, name: e.name, image: e.image || '' })))

const maintenanceList = computed(() => {
  const pendingByEquip = new Set(state.maintenanceRequests.filter(r => r.status === 'pending').map(r => r.equipmentId))
  return state.equipments.map(e => ({
    id: e.id,
    name: e.name,
    status: (e.status === 'pending_maintenance' || pendingByEquip.has(e.id)) ? 'pending' : 'done',
  }))
})

const pendingRequests = computed(() =>
  state.maintenanceRequests
    .filter(r => r.status === 'pending')
    .map(r => {
      const eq = state.equipments.find(e => e.id === r.equipmentId)
      const requester = state.usersMap.get(r.userId)
      return {
        id: r.id,
        equipmentId: r.equipmentId,
        equipmentName: eq?.name || `#${r.equipmentId}`,
        equipmentImage: eq?.image || '',
        requester: requester ? requester.name : `User #${r.userId}`,
        createdAt: r.createdAt,
        selectedDate: r.selectedDate,
      }
    })
)

async function acceptRequest(id) {
  await http(`${API}/maintenanceRequests/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) })
  await loadMaintenanceRequests()
}
async function denyRequest(id) {
  await http(`${API}/maintenanceRequests/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) })
  await loadMaintenanceRequests()
}
async function payInvoice(id) {
  await http(`${API}/billingInvoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'paid', paidAt: todayISO() }) })
  await loadInvoices()
}

onMounted(loadAll)
</script>

<template>
  <section class="home">
    <div class="header-spacer" />

    <div class="grid">
      <!-- Left -->
      <div class="col left">
        <!-- Equipos -->
        <div class="panel">
          <h2 class="panel-title">{{ $t('homeProviders.sections.myGymEquipment') }}</h2>
          <div v-if="state.loading" class="muted">{{ $t('homeProviders.loading') }}</div>
          <div v-else class="equipment-grid">
            <div v-for="card in equipmentCards" :key="card.id" class="equipment-card">
              <img v-if="card.image" :src="card.image" :alt="card.name" />
              <div class="equipment-name">{{ card.name }}</div>
            </div>
            <div v-if="!equipmentCards.length" class="muted">{{ $t('homeProviders.empty.noEquipment') }}</div>
          </div>
        </div>

        <!-- Maintenance -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ $t('homeProviders.sections.maintenance') }}</h2>
          </div>

          <ul class="maintenance-list">
            <li v-for="m in maintenanceList" :key="m.id" class="maintenance-item">
              <span class="m-name">{{ m.name }}</span>
              <span class="badge" :class="m.status === 'pending' ? 'bad-warning' : 'bad-success'">
                {{ m.status === 'pending' ? $t('accountStatement.item.pending') : $t('accountStatement.item.paid') }}
              </span>
            </li>
          </ul>

          <p class="muted note">{{ $t('homeProviders.notes.maintenance') }}</p>
        </div>
      </div>

      <!-- Right -->
      <div class="col right">
        <!-- Requests -->
        <div class="panel">
          <h2 class="panel-title">{{ $t('homeProviders.sections.requests') }}</h2>

          <div v-if="pendingRequests.length === 0" class="muted">{{ $t('homeProviders.empty.noRequests') }}</div>

          <div v-for="req in pendingRequests" :key="req.id" class="request-card">
            <div class="req-left">
              <img v-if="req.equipmentImage" :src="req.equipmentImage" :alt="req.equipmentName" />
              <div>
                <div class="req-title">{{ req.equipmentName }}</div>
                <div class="req-sub">
                  {{ $t('homeProviders.labels.requestedBy') }}: <strong>{{ req.requester }}</strong>
                </div>
                <div class="req-sub">{{ $t('homeProviders.labels.date') }}: {{ req.selectedDate }}</div>
              </div>
            </div>
            <div class="req-actions">
              <button class="btn-accept" @click="acceptRequest(req.id)">{{ $t('homeProviders.buttons.accept') }}</button>
              <button class="btn-deny" @click="denyRequest(req.id)">{{ $t('homeProviders.buttons.deny') }}</button>
            </div>
          </div>
        </div>

        <!-- Billing & Payments -->
        <div class="panel">
          <h2 class="panel-title">{{ $t('homeProviders.sections.billingPayments') }}</h2>

          <div v-if="!state.invoices.length" class="muted">{{ $t('homeProviders.empty.noInvoices') }}</div>

          <div v-for="inv in state.invoices" :key="inv.id" class="invoice-row">
            <div class="inv-left">{{ inv.companyName }}</div>
            <div class="inv-right">
              <span class="inv-amount">{{ moneyPEN(inv.amount) }}</span>
              <span class="badge" :class="(inv.statusComputed === 'paid') ? 'bad-success' : 'bad-warning'">
                {{ (inv.statusComputed === 'paid') ? $t('accountStatement.item.paid') : $t('accountStatement.item.pending') }}
              </span>
              <button v-if="inv.statusComputed !== 'paid'" class="btn-pay" @click="payInvoice(inv.id)">
                {{ $t('homeProviders.buttons.pay') }}
              </button>
            </div>
          </div>

          <p class="muted note">{{ $t('homeProviders.notes.billing') }}</p>
        </div>
      </div>
    </div>

    <button class="fab" :title="$t('homeProviders.buttons.goToMaintenance')" @click="router.push({ name: 'home-providers-2' })">
      ➜
    </button>

    <div v-if="state.error" class="error-box">{{ state.error }}</div>
  </section>
</template>

<style scoped>
.home{padding:16px 18px 64px;background:#eef3f9;min-height:100vh;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",sans-serif}
.header-spacer{height:8px}
.grid{display:grid;grid-template-columns:2fr 1.2fr;gap:16px}
.col{display:flex;flex-direction:column;gap:16px}
.panel{background:#f5f9ff;border:1px solid #e3ecfb;border-radius:14px;padding:16px;box-shadow:0 6px 20px rgba(25,118,210,.08)}
.panel-title{font-size:24px;color:#1671d9;margin:0 0 10px;font-weight:700}
.panel-header{display:flex;align-items:center;justify-content:space-between}
.equipment-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.equipment-card{background:#fff;border:1px solid #eaeef5;border-radius:12px;padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.equipment-card img{max-width:170px;max-height:110px;object-fit:contain}
.equipment-name{font-weight:600;color:#333;text-align:center}
.maintenance-list{list-style:none;margin:0;padding:0}
.maintenance-item{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #eaeef5;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.m-name{font-weight:600;color:#333}
.request-card{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;background:#fff;border:1px solid #eaeef5;border-radius:12px;margin-bottom:10px}
.req-left{display:flex;gap:12px;align-items:center}
.request-card img{width:64px;height:48px;object-fit:contain}
.req-title{font-weight:700;margin-bottom:2px}
.req-sub{font-size:12.5px;color:#666}
.req-actions{display:flex;gap:8px}
.btn-accept,.btn-deny,.btn-pay{border:none;border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer}
.btn-accept{background:#1fa34a;color:#fff}
.btn-accept:hover{background:#16853b}
.btn-deny{background:#d93434;color:#fff}
.btn-deny:hover{background:#b42222}
.invoice-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #eaeef5;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.inv-left{font-weight:700;color:#333}
.inv-right{display:flex;align-items:center;gap:10px}
.inv-amount{font-weight:700;color:#212121}
.btn-pay{background:#1976d2;color:#fff}
.btn-pay:hover{background:#1565c0}
.badge{display:inline-flex;align-items:center;justify-content:center;height:26px;padding:0 10px;border-radius:999px;font-size:12.5px;font-weight:700;border:1px solid transparent}
.bad-success{background:#e8f8ee;color:#18883f;border-color:#b8ebc9}
.bad-warning{background:#fdecec;color:#c03a3a;border-color:#f5c6c6}
.muted{color:#677;font-size:13px}
.note{margin-top:10px}
.fab{position:fixed;right:22px;bottom:22px;width:54px;height:54px;border-radius:50%;background:#1976d2;color:#fff;border:none;font-size:22px;font-weight:900;box-shadow:0 10px 30px rgba(25,118,210,.35);cursor:pointer}
.fab:hover{background:#1565c0}
.error-box{margin-top:16px;background:#fff4f4;color:#b10000;border:1px solid #f6c6c6;border-radius:10px;padding:10px 12px}
@media (max-width:1000px){.grid{grid-template-columns:1fr}}
</style>
