<template>
  <section class="grid">
    <div
      class="panel panel--link"
      role="button"
      tabindex="0"
      @click="goTo('machines')"
      @keydown="onKey($event, 'machines')"
    >
      <h2 class="panel__title">My machines</h2>
      <template v-if="isLoading.myMachines"><p class="muted">Cargando tus máquinas…</p></template>
      <template v-else-if="error.myMachines"
        ><p class="text-red-500">Error: {{ error.myMachines.message }}</p></template
      >
      <div v-else class="cards">
        <MachineCard v-for="m in myMachines" :key="m.id" :img="m.img" :title="m.name" />
      </div>
      <p v-if="!isLoading.myMachines && myMachines.length === 0" class="muted spacer">
        No tienes máquinas asignadas.
      </p>
    </div>

    <div
      class="panel panel--link"
      role="button"
      tabindex="0"
      @click="goTo('rent')"
      @keydown="onKey($event, 'rent')"
    >
      <h2 class="panel__title">Rent machines</h2>
      <template v-if="isLoading.rentMachines"
        ><p class="muted">Cargando máquinas de renta…</p></template
      >
      <template v-else-if="error.rentMachines"
        ><p class="text-red-500">Error: {{ error.rentMachines.message }}</p></template
      >
      <div v-else class="cards">
        <MachineCard
          v-for="m in rentMachines"
          :key="m.id"
          :img="m.img"
          :title="m.name"
          :subtitle="m.price"
          :isPrice="true"
        />
      </div>
      <p v-if="!isLoading.rentMachines && rentMachines.length === 0" class="muted spacer">
        No hay máquinas disponibles para renta.
      </p>
    </div>

    <div
      class="panel panel--link"
      role="button"
      tabindex="0"
      @click="goTo('maintenance')"
      @keydown="onKey($event, 'maintenance')"
    >
      <h2 class="panel__title">Maintenance</h2>
      <template v-if="isLoading.maintenance"><p class="muted">Cargando solicitudes…</p></template>
      <template v-else-if="error.maintenance"
        ><p class="text-red-500">Error: {{ error.maintenance.message }}</p></template
      >
      <ul v-else-if="maintenance.length > 0" class="list">
        <li class="list__item" v-for="i in maintenance" :key="i.id">
          <span class="list__label">{{ i.equipmentName }}</span>
          <span class="badge" :class="i.status === 'Done' ? 'badge--ok' : 'badge--warn'">{{
            i.status
          }}</span>
        </li>
      </ul>
      <p v-else class="muted spacer">
        Aquí se mostrarán las solicitudes de mantenimiento de tu equipo.
      </p>
    </div>

    <div
      class="panel panel--link"
      role="button"
      tabindex="0"
      @click="goTo('account-statement')"
      @keydown="onKey($event, 'account-statement')"
    >
      <h2 class="panel__title">Account statement</h2>
      <template v-if="isLoading.account"><p class="muted">Cargando extracto…</p></template>
      <template v-else-if="error.account"
        ><p class="text-red-500">Error: {{ error.account.message }}</p></template
      >
      <ul v-else-if="account.length > 0" class="list">
        <li class="list__item" v-for="t in account" :key="t.id">
          <span class="list__label">{{ t.entity }}</span>
          <span class="list__amount">{{ t.amount }}</span>
          <span class="badge" :class="t.status === 'Done' ? 'badge--ok' : 'badge--warn'">{{
            t.status
          }}</span>
        </li>
      </ul>
      <p v-else class="muted spacer">Aquí se mostrará el estado de cuenta de tus transacciones.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MachineCard from '@/shared-kernel/presentation/ui/components/machine-card.component.vue'
import { http } from '@/shared-kernel/infrastructure/http'

const router = useRouter()
const goTo = (name) => router.push({ name })
const onKey = (e, name) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    goTo(name)
  }
}

const myMachines = ref([])
const rentMachines = ref([])
const maintenance = ref([])
const account = ref([])

const isLoading = ref({ myMachines: true, rentMachines: true, maintenance: true, account: true })
const error = ref({ myMachines: null, rentMachines: null, maintenance: null, account: null })

const myMachineIds = [1, 2]
const rentOrder = [2, 1]
const USER_ID = 1

const formatCurrency = (amount, currency = 'PEN') => {
  if (typeof amount !== 'number') return amount
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
const normalizeStatus = (s) => {
  const v = String(s || '').toLowerCase()
  if (['paid', 'completed', 'resolved', 'done'].includes(v)) return 'Done'
  if (['pending', 'pending_maintenance', 'open'].includes(v)) return 'Pending'
  return s
}

const fetchEquipment = async () => {
  isLoading.value.myMachines = true
  isLoading.value.rentMachines = true
  error.value.myMachines = null
  error.value.rentMachines = null
  try {
    const { data: equipmentDataRaw } = await http.get('/equipments')
    const { data: rentalCatalog } = await http.get('/rentalCatalog')

    const equipmentMap = new Map(
      equipmentDataRaw.map((e) => [
        e.id,
        { id: e.id, name: e.name, img: e.image || '/assets/images/placeholder.png' },
      ]),
    )

    myMachines.value = myMachineIds.map((id) => equipmentMap.get(id)).filter(Boolean)

    const rentalMap = new Map(rentalCatalog.map((r) => [r.id, r]))
    rentMachines.value = rentOrder
      .map((id) => {
        const cat = rentalMap.get(id)
        if (!cat) return null
        return {
          id,
          name: cat.equipmentName,
          img: cat.imageUrl || equipmentMap.get(id)?.img || '/assets/images/placeholder.png',
          price: `${formatCurrency(cat.monthlyPriceUSD, cat.currency)} / month`,
        }
      })
      .filter(Boolean)
  } catch (err) {
    error.value.myMachines = err
    error.value.rentMachines = err
  } finally {
    isLoading.value.myMachines = false
    isLoading.value.rentMachines = false
  }
}

const fetchMaintenance = async () => {
  isLoading.value.maintenance = true
  error.value.maintenance = null
  maintenance.value = []
  try {
    const [{ data: requests }, { data: equipment }] = await Promise.all([
      http.get('/maintenanceRequests'),
      http.get('/equipments'),
    ])
    const equipmentMap = new Map(equipment.map((e) => [e.id, e]))
    const consolidated = new Map()
    requests.forEach((req) => {
      const equip = equipmentMap.get(req.equipmentId)
      if (equip && !consolidated.has(req.equipmentId)) {
        consolidated.set(req.equipmentId, {
          id: req.equipmentId,
          equipmentName: equip.name,
          status: normalizeStatus(req.status),
        })
      }
    })
    equipment
      .filter((e) => e.status === 'pending_maintenance')
      .forEach((e) => {
        consolidated.set(e.id, {
          id: e.id,
          equipmentName: e.name,
          status: normalizeStatus(e.status),
        })
      })
    maintenance.value = Array.from(consolidated.values())
  } catch (err) {
    error.value.maintenance = err
  } finally {
    isLoading.value.maintenance = false
  }
}

const fetchAccount = async () => {
  isLoading.value.account = true
  error.value.account = null
  account.value = []
  try {
    const { data: invoices } = await http.get('/billingInvoices')
    account.value = invoices
      .filter((t) => t.userId === USER_ID)
      .map((t) => ({
        id: t.id,
        entity: t.companyName,
        amount: formatCurrency(t.amount, t.currency),
        status: normalizeStatus(t.status),
      }))
  } catch (err) {
    error.value.account = err
  } finally {
    isLoading.value.account = false
  }
}

onMounted(() => {
  fetchEquipment()
  fetchMaintenance()
  fetchAccount()
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 22px;
  grid-template-columns: 1fr 1fr;
}
.panel {
  background: var(--panel);
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(23, 43, 77, 0.08);
}
.panel__title {
  margin: 6px 0 14px;
  color: var(--primary);
  font-size: 1.6rem;
  font-weight: 800;
}
.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.list__item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 6px 20px rgba(23, 43, 77, 0.08);
}
.list__label {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list__amount {
  font-weight: 700;
}
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #f2f4f7;
  font-weight: 700;
}
.badge--ok {
  background: #e9f8ee;
  color: var(--ok);
}
.badge--warn {
  background: #ffecec;
  color: var(--warn);
}
.muted {
  color: var(--muted);
}
.spacer {
  margin-top: 14px;
}
.panel--link {
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease;
}
.panel--link:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(23, 43, 77, 0.12);
}
.panel--link:focus-visible {
  outline: 3px solid #7aa6ff;
  outline-offset: 3px;
}
.text-red-500 {
  color: #e74c3c;
  font-weight: 600;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
