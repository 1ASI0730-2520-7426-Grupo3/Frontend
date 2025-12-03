<template>
  <section class="dashboard-wrapper">
    <div class="grid">
      <div class="panel panel--link" role="button" tabindex="0" @click="goTo('my-machines')">
        <div class="panel-header">
          <h2 class="panel__title">{{ $t('client.home.myMachines.title') }}</h2>
          <span class="badge-count" v-if="!isLoading.myMachines">{{ myMachines.length }}</span>
        </div>

        <template v-if="isLoading.myMachines">
          <div class="loading-state"><i class="pi pi-spin pi-spinner"></i></div>
        </template>

        <template v-else-if="error.myMachines">
          <p class="text-red-500 text-sm">{{ $t('client.home.myMachines.errorLoading') }}</p>
        </template>

        <div v-else class="cards">
          <MachineCard
            v-for="m in myMachines.slice(0, 2)"
            :key="m.id"
            :img="m.img"
            :title="m.name"
          />
        </div>

        <p v-if="!isLoading.myMachines && myMachines.length === 0" class="muted spacer">
          {{ $t('client.home.myMachines.noMachines') }}
        </p>
      </div>

      <div class="panel panel--link" role="button" tabindex="0" @click="goTo('rent')">
        <div class="panel-header">
          <h2 class="panel__title">{{ $t('client.home.rentMachines.title') }}</h2>
        </div>

        <template v-if="isLoading.rentMachines">
          <div class="loading-state"><i class="pi pi-spin pi-spinner"></i></div>
        </template>

        <template v-else-if="error.rentMachines">
          <p class="text-red-500 text-sm">
            {{ $t('client.home.rentMachines.catalogUnavailable') }}
          </p>
        </template>

        <div v-else class="cards">
          <MachineCard
            v-for="m in rentMachines.slice(0, 2)"
            :key="m.id"
            :img="m.img"
            :title="m.name"
            :subtitle="m.price"
            :isPrice="true"
          />
        </div>
      </div>

      <div class="panel panel--link" role="button" tabindex="0" @click="goTo('maintenance')">
        <div class="panel-header">
          <h2 class="panel__title">{{ $t('client.home.maintenance.title') }}</h2>
          <span class="badge-count orange" v-if="maintenance.length > 0">{{
            maintenance.length
          }}</span>
        </div>

        <template v-if="isLoading.maintenance">
          <div class="loading-state"><i class="pi pi-spin pi-spinner"></i></div>
        </template>

        <ul v-else-if="maintenance.length > 0" class="list">
          <li class="list__item" v-for="item in maintenance.slice(0, 3)" :key="item.id">
            <div class="maintenance-info">
              <span class="list__label">{{ item.equipmentName }}</span>
              <span v-if="item.assignedProviderName" class="provider-accepted">
                <i class="pi pi-check-circle"></i>
                {{ $t('client.home.maintenance.acceptedBy') }} <strong>{{ item.assignedProviderName }}</strong>
              </span>
            </div>
            <span class="badge" :class="getStatusClass(item.status)">
              {{ item.status }}
            </span>
          </li>
        </ul>

        <p v-else class="muted spacer">{{ $t('client.home.maintenance.noPending') }}</p>
      </div>

      <div class="panel panel--link" role="button" tabindex="0" @click="goTo('account-statement')">
        <div class="panel-header">
          <h2 class="panel__title">{{ $t('client.home.accountStatement.title') }}</h2>
          <span class="badge-count green" v-if="account.length > 0">{{ account.length }}</span>
        </div>

        <template v-if="isLoading.account">
          <div class="loading-state"><i class="pi pi-spin pi-spinner"></i></div>
        </template>

        <ul v-else-if="account.length > 0" class="list">
          <li class="list__item" v-for="inv in account.slice(0, 3)" :key="inv.id">
            <span class="list__label">{{ inv.entity }}</span>
            <span class="list__amount">{{ inv.amount }}</span>
            <span
              class="badge"
              :class="inv.status.toLowerCase() === 'paid' ? 'badge--ok' : 'badge--warn'"
            >
              {{ inv.status }}
            </span>
          </li>
        </ul>

        <p v-else class="muted spacer">{{ $t('client.home.accountStatement.upToDate') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MachineCard from '@/shared-kernel/presentation/ui/components/machine-card.component.vue'

import { EquipmentApiService } from '../../../equipment/infrastructure/equipment-api.service.js'
import { MaintenanceApiService } from '../../../maintenance/infrastructure/maintenance.api-service.js'
import { AccountStatementApiService } from '../../../account-statement/infrastructure/account-statement.api-service.js'
import { RentApiService } from '../../../rent/infrastructure/rent.api.service.js'
import { UserApiService } from '@/shared-kernel/infrastructure/user.api-service.js'

const router = useRouter()
const route = useRoute()
const goTo = (name) => router.push({ name })

const equipmentService = new EquipmentApiService()
const maintenanceService = new MaintenanceApiService()
const billingService = new AccountStatementApiService()
const rentService = new RentApiService()
const userService = new UserApiService()

const myMachines = ref([])
const rentMachines = ref([])
const maintenance = ref([])
const account = ref([])

const isLoading = ref({ myMachines: true, rentMachines: true, maintenance: true, account: true })
const error = ref({ myMachines: null, rentMachines: null, maintenance: null, account: null })

const USER_ID = localStorage.getItem('userId') || 1

const formatCurrency = (amount) => {
  // Always use USD
  const currency = 'USD'
  const locale = 'en-US'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

const getStatusClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'done' || s === 'resolved') return 'badge--done'
  if (s === 'pending') return 'badge--pending'
  return 'badge--warn'
}

const fetchData = async () => {
  try {
    const data = await equipmentService.getClientEquipment(USER_ID)
    myMachines.value = data.map((e) => ({
      id: e.id,
      name: e.name,
      img: e.image || 'https://placehold.co/400x300/e0e0e0/ffffff?text=Gym',
    }))
  } catch (e) {
    error.value.myMachines = e
  } finally {
    isLoading.value.myMachines = false
  }

  try {
    const data = await rentService.getRentalCatalog()
    rentMachines.value = data.map((m) => ({
      id: m.id,
      name: m.name,
      img: m.image || 'https://placehold.co/400x300/e0e0e0/ffffff?text=Rent',
      price: m.getFormattedPrice(),
    }))
  } catch (e) {
    error.value.rentMachines = e
  } finally {
    isLoading.value.rentMachines = false
  }

  try {
    const [requests, equipments] = await Promise.all([
      maintenanceService.getAllRequests(),
      equipmentService.getClientEquipment(USER_ID),
    ])

    console.log('All maintenance requests:', requests)
    console.log('Current user ID:', USER_ID, 'Type:', typeof USER_ID)

    // Debug: Log each request to see its structure
    requests.forEach((r, index) => {
      console.log(`Request ${index}:`, {
        id: r.id,
        requestedByUserId: r.requestedByUserId,
        userId: r.userId,
        equipmentId: r.equipmentId,
        status: r.status
      })
    })

    // SECURITY FIX: Filter to only show requests created by the current user
    // Convert USER_ID to number to ensure type matching
    const userIdNum = Number(USER_ID)
    const myRequests = requests.filter(r => {
      const match = Number(r.requestedByUserId) === userIdNum || Number(r.userId) === userIdNum
      console.log(`Checking request ${r.id}: requestedByUserId=${r.requestedByUserId}, userId=${r.userId}, matches=${match}`)
      return match
    })
    console.log('My maintenance requests:', myRequests)

    const eqMap = new Map(equipments.map((e) => [e.id, e.name]))

    // Fetch provider information for assigned maintenance requests
    const providerIds = [...new Set(myRequests.filter(r => r.assignedToProviderId).map(r => r.assignedToProviderId))]
    console.log('Provider IDs to fetch:', providerIds)

    const providerMap = await userService.getUsersByIds(providerIds)
    console.log('Provider map:', providerMap)

    // Convert user objects to names
    const providerNameMap = new Map(
      Array.from(providerMap.entries()).map(([id, user]) => {
        console.log(`Provider ${id}:`, user)
        return [id, user.name || user.username || `Provider #${id}`]
      })
    )

    maintenance.value = myRequests.map((r) => {
      const providerName = r.assignedToProviderId ? providerNameMap.get(r.assignedToProviderId) : null
      console.log(`Request ${r.id}: assignedToProviderId=${r.assignedToProviderId}, providerName=${providerName}`)
      return {
        id: r.id,
        equipmentName: eqMap.get(r.equipmentId) || `Equipment #${r.equipmentId}`,
        status: r.status,
        assignedProviderName: providerName,
      }
    })
  } catch (e) {
    error.value.maintenance = e
  } finally {
    isLoading.value.maintenance = false
  }

  try {
    const invoices = await billingService.getInvoicesByUser(USER_ID)
    account.value = invoices
      .filter((inv) => inv.status.toLowerCase() === 'pending')
      .map((inv) => ({
        id: inv.id,
        entity: inv.companyName,
        amount: formatCurrency(inv.amount, inv.currency),
        status: inv.status,
      }))
  } catch (e) {
    error.value.account = e
  } finally {
    isLoading.value.account = false
  }
}

onMounted(() => {
  fetchData()
})

// Refresh data when navigating back to this page (e.g., after creating a maintenance request)
onActivated(() => {
  console.log('Home page activated - refreshing data...')
  fetchData()
})

// Watch for route changes to refresh data
watch(() => route.path, (newPath) => {
  if (newPath === '/home' || newPath === '/') {
    console.log('Navigated to home - refreshing data...')
    fetchData()
  }
})
</script>

<style scoped>
.dashboard-wrapper {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.panel {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 280px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.panel__title {
  margin: 0;
  color: #3b82f6;
  font-size: 1.25rem;
  font-weight: 700;
}

.badge-count {
  background: #3b82f6;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
}
.badge-count.orange {
  background: #f97316;
}
.badge-count.green {
  background: #22c55e;
}

.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list__item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
}

.maintenance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list__label {
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-accepted {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 500;
}

.provider-accepted i {
  color: #22c55e;
  font-size: 0.875rem;
}

.provider-accepted strong {
  color: #15803d;
}

.list__amount {
  font-weight: 700;
  color: #0f172a;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.badge--pending {
  background: transparent;
  color: #dc2626;
  border: none;
}

.badge--done {
  background: transparent;
  color: #16a34a;
  border: none;
}

.badge--ok {
  background: #dcfce7;
  color: #166534;
}

.badge--warn {
  background: #fee2e2;
  color: #991b1b;
}

.muted {
  color: #64748b;
  font-style: italic;
  text-align: center;
  margin-top: 20px;
}

.panel--link {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.panel--link:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
