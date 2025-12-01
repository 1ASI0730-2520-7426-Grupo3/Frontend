<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

const state = reactive({
  loading: false,
  equipments: [],
  equipById: new Map(),
  usersMap: new Map(),
  pendingRequests: [],
  error: ''
})

async function loadEquipments() {
  const rows = await http(`${API}/equipments?_sort=name&_order=asc`)
  state.equipments = rows
  state.equipById = new Map(rows.map(e => [e.id, e]))
}

async function loadUsers() {
  const users = await http(`${API}/users`)
  state.usersMap = new Map(users.map(u => [u.id, u]))
}

async function loadPendingRequests() {
  const reqs = await http(`${API}/maintenanceRequests?status=pending&_sort=createdAt&_order=desc`)
  state.pendingRequests = reqs.map(r => {
    const eq = state.equipById.get(r.equipmentId)
    const user = state.usersMap.get(r.userId)
    return {
      id: r.id,
      equipmentId: r.equipmentId,
      equipmentName: eq?.name ?? `#${r.equipmentId}`,
      equipmentImage: eq?.image ?? '',
      clientName: user?.name ?? `User #${r.userId}`,
      status: r.status,
      selectedDate: r.selectedDate
    }
  })
}

async function submitRequest(id) {
  await http(`${API}/maintenanceRequests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'accepted' })
  })
  await loadPendingRequests()
}

const machineCards = computed(() =>
  state.equipments.map(e => ({ id: e.id, name: e.name, image: e.image || '' }))
)

async function loadAll() {
  state.loading = true; state.error = ''
  try {
    await loadEquipments()
    await loadUsers()
    await loadPendingRequests()
  } catch (e) {
    console.error(e); state.error = e.message || 'Unexpected error'
  } finally {
    state.loading = false
  }
}

onMounted(loadAll)
</script>

<template>
  <section class="wrap">
    <div class="grid">
      <!-- My machines -->
      <div class="col">
        <div class="panel">
          <h2 class="title">{{ $t('homeProviders2.sections.myMachines') }}</h2>

          <div v-if="state.loading" class="muted">{{ $t('homeProviders2.loading') }}</div>

          <div v-else class="cards">
            <div v-for="m in machineCards" :key="m.id" class="card">
              <img v-if="m.image" :src="m.image" :alt="m.name" />
              <div class="name">{{ m.name }}</div>
            </div>
            <div v-if="!machineCards.length" class="muted">
              {{ $t('homeProviders2.empty.noMachines') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Maintenance -->
      <div class="col">
        <div class="panel">
          <h2 class="title">{{ $t('homeProviders2.sections.maintenance') }}</h2>

          <div v-if="state.pendingRequests.length === 0" class="muted">
            {{ $t('homeProviders2.empty.noRequests') }}
          </div>

          <div v-for="r in state.pendingRequests" :key="r.id" class="req-card">
            <div class="req-left">
              <img v-if="r.equipmentImage" :src="r.equipmentImage" :alt="r.equipmentName" />
              <div class="req-info">
                <div class="req-eq">{{ r.equipmentName }}</div>
                <div class="req-client">
                  {{ $t('homeProviders2.labels.client') }}: <strong>{{ r.clientName }}</strong>
                </div>
              </div>
            </div>

            <div class="req-right">
              <span class="badge bad-warning">{{ $t('homeProviders2.badges.pending') }}</span>
              <button class="btn-submit" @click="submitRequest(r.id)">
                {{ $t('homeProviders2.buttons.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB a la izquierda: volver a home-providers -->
    <button
      class="fab fab-left"
      :title="$t('homeProviders2.buttons.back')"
      @click="router.push({ name: 'home-providers' })"
    >←</button>

    <div v-if="state.error" class="error">{{ state.error }}</div>
  </section>
</template>

<style scoped>
.wrap{background:#eef3f9;min-height:100vh;padding:18px 20px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.grid{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.col{display:flex;flex-direction:column;gap:16px}
.panel{background:#ecf3fb;border:1px solid #dfeafb;border-radius:14px;padding:16px;box-shadow:0 6px 20px rgba(25,118,210,.08)}
.title{font-size:28px;color:#1671d9;margin:0 0 12px;font-weight:800}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.card{background:#fff;border:1px solid #eaeef5;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;align-items:center}
.card img{max-width:210px;max-height:120px;object-fit:contain}
.name{font-weight:700;color:#222;text-align:center}
.req-card{display:flex;justify-content:space-between;align-items:center;gap:14px;background:#fff;border:1px solid #eaeef5;border-radius:12px;padding:14px;margin-bottom:12px}
.req-left{display:flex;gap:12px;align-items:center}
.req-left img{width:70px;height:50px;object-fit:contain}
.req-eq{font-weight:800;margin-bottom:2px}
.req-client{font-size:13.5px;color:#444}
.req-right{display:flex;align-items:center;gap:10px}
.badge{display:inline-flex;align-items:center;justify-content:center;height:26px;padding:0 10px;border-radius:999px;font-size:12.5px;font-weight:800;border:1px solid transparent}
.bad-warning{background:#fdecec;color:#c03a3a;border-color:#f5c6c6}
.btn-submit{border:none;border-radius:10px;padding:8px 16px;background:#1fa34a;color:#fff;font-weight:800;cursor:pointer}
.btn-submit:hover{background:#16853b}
.muted{color:#667;font-size:13.5px}
.fab{position:fixed;right:22px;bottom:22px;width:54px;height:54px;border-radius:50%;background:#1976d2;color:#fff;border:none;font-size:22px;font-weight:900;box-shadow:0 10px 30px rgba(25,118,210,.35);cursor:pointer}
.fab:hover{background:#1565c0}
.fab-left{ left:22px; right:auto }
.error{margin-top:14px;background:#fff4f4;color:#b10000;border:1px solid #f6c6c6;border-radius:10px;padding:10px 12px}
@media (max-width:1000px){.grid{grid-template-columns:1fr}}
</style>
