<template>
  <div class="provider-home">
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- My Gym Equipment Section -->
        <section class="dashboard-section">
          <h2 class="section-title">{{ t('provider.home.gymEquipment.title') }}</h2>
          <div class="equipment-grid">
            <Card v-for="equipment in gymEquipment" :key="equipment.id" class="equipment-card">
              <template #content>
                <div class="equipment-content">
                  <img :src="equipment.image" :alt="equipment.name" class="equipment-image" />
                  <p class="equipment-name">{{ equipment.name }}</p>
                </div>
              </template>
            </Card>
          </div>
        </section>

        <!-- Maintenance Requests Section -->
        <section class="dashboard-section">
          <h2 class="section-title">{{ t('provider.home.maintenance.title') }}</h2>
          <div class="maintenance-list">
            <div v-for="request in pendingMaintenanceRequests.slice(0, 3)" :key="request.id" class="maintenance-item">
              <div class="maintenance-info">
                <span class="maintenance-name">{{ request.equipmentName }}</span>
                <span class="maintenance-client">{{ request.clientName }} | {{ request.clientEmail }}</span>
              </div>
              <Button
                :label="t('provider.home.actions.accept')"
                severity="success"
                size="small"
                icon="pi pi-check"
                @click="handleAcceptMaintenanceRequest(request.id)"
              />
            </div>
            <p v-if="pendingMaintenanceRequests.length === 0" class="empty-message">
              {{ t('provider.home.maintenance.noRequests') }}
            </p>
          </div>
          <p class="section-note">
            {{ t('provider.home.maintenance.note') }}
          </p>
        </section>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Rental Requests Section -->
        <section class="dashboard-section">
          <h2 class="section-title">{{ t('provider.home.rentalRequests.title') }}</h2>
          <div class="requests-list">
            <Card v-for="request in rentalRequests" :key="request.id" class="request-card">
              <template #content>
                <div class="request-content">
                  <div class="request-left">
                    <img
                      :src="request.equipmentImage"
                      :alt="request.equipmentName"
                      class="request-image"
                    />
                    <div class="request-info">
                      <p class="request-equipment">{{ request.equipmentName }}</p>
                      <p class="request-detail">
                        <strong>{{ t('provider.home.rentalRequests.requestedBy') }}</strong
                        ><br />{{ request.clientName }}
                      </p>
                      <p class="request-detail">
                        <strong>{{ t('provider.home.rentalRequests.time') }}</strong
                        ><br />{{ request.duration }}
                      </p>
                    </div>
                  </div>
                  <div class="request-actions">
                    <Button
                      :label="t('provider.home.actions.accept')"
                      severity="success"
                      size="small"
                      @click="handleAcceptRentalRequest(request.id)"
                    />
                    <Button
                      :label="t('provider.home.actions.deny')"
                      severity="danger"
                      size="small"
                      @click="handleDenyRentalRequest(request.id)"
                    />
                  </div>
                </div>
              </template>
            </Card>
            <p v-if="rentalRequests.length === 0" class="empty-message">
              {{ t('provider.home.rentalRequests.noRequests') }}
            </p>
          </div>
        </section>

        <!-- Billing & Payments Section -->
        <section class="dashboard-section">
          <h2 class="section-title">{{ t('provider.home.billing.title') }}</h2>
          <div class="billing-list">
            <div v-for="payment in billingPayments" :key="payment.id" class="billing-item">
              <div class="billing-info">
                <span class="billing-company">{{ payment.companyName }}</span>
                <span class="billing-amount">$ {{ payment.amount.toFixed(2) }}</span>
              </div>
              <Tag
                :value="payment.status"
                :severity="
                  payment.status === t('provider.home.billing.paid') ? 'success' : 'warning'
                "
              />
            </div>
          </div>
          <p class="section-note">
            {{ t('provider.home.billing.note') }}
          </p>
        </section>
      </div>
    </div>

    <!-- Navigation Arrow -->
    <button
      class="nav-arrow right"
      @click="goToDetails"
      :title="t('provider.home.billing.viewMore')"
    >
      <i class="pi pi-arrow-right"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { ProviderApiService } from '@/contexts/provider/infrastructure/provider-api.service'
import { UserApiService } from '@/shared-kernel/infrastructure/user.api-service'

defineOptions({
  name: 'ProviderHomePage',
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const providerService = new ProviderApiService()
const userService = new UserApiService()

const gymEquipment = ref([])
const rentalRequests = ref([])
const pendingMaintenanceRequests = ref([])
const billingPayments = ref([])
const loading = ref(true)

const loadProviderData = async () => {
  try {
    loading.value = true

    const [equipment, pendingRentals, pendingMaintenance, invoices] = await Promise.all([
      providerService.getProviderEquipment(),
      providerService.getPendingRentalRequests(),
      providerService.getPendingMaintenanceRequests(),
      providerService.getAllInvoices(),
    ])

    gymEquipment.value = equipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      image: eq.image || '/placeholder-equipment.png',
    }))

    rentalRequests.value = pendingRentals.map((req) => ({
      id: req.id,
      equipmentName: req.equipmentName || `Equipment #${req.equipmentId}`,
      equipmentImage: req.equipmentImage || '/placeholder-equipment.png',
      clientName: req.clientEmail || `Client #${req.clientId}`,
      duration: '1 year',
    }))



    // Create equipment map for looking up names
    const equipmentMap = new Map(equipment.map(eq => [eq.id, eq.name]))

    const clientIds = [...new Set(
      pendingMaintenance
        .filter(r => r.clientId !== undefined && r.clientId !== null)
        .map(r => r.clientId)
    )]

    const clientMap = await userService.getUsersByIds(clientIds)

    pendingMaintenanceRequests.value = pendingMaintenance.map((req) => {
      const client = clientMap.get(req.clientId)
      const equipmentName = equipmentMap.get(req.equipmentId) || req.equipmentName || `Equipment #${req.equipmentId}`

      return {
        id: req.id,
        equipmentId: req.equipmentId,
        equipmentName: equipmentName,
        clientId: req.clientId,
        clientName: client?.name || client?.username || `User #${req.clientId || 'unknown'}`,
        clientEmail: client?.email || 'No email',
        observation: req.observation || '',
        selectedDate: req.selectedDate,
      }
    })

    const providerId = parseInt(localStorage.getItem('userId'))
    const providerInvoices = invoices.filter((invoice) => invoice.providerId === providerId)

    billingPayments.value = providerInvoices.map((invoice) => ({
      id: invoice.id,
      companyName: invoice.companyName,
      amount: invoice.amount,
      status:
        invoice.status === 'paid'
          ? t('provider.home.billing.paid')
          : t('provider.home.billing.pending'),
    }))
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('provider.home.toast.failedToLoad')
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleAcceptRentalRequest = async (requestId) => {
  try {
    await providerService.approveRentalRequest(requestId)
    toast.add({
      severity: 'success',
      summary: t('provider.home.toast.rentalRequestAccepted'),
      detail: t('provider.home.toast.rentalAcceptSuccess'),
      life: 3000,
    })
    await loadProviderData()
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('provider.home.toast.failedToAcceptRental')
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

const handleDenyRentalRequest = async (requestId) => {
  try {
    await providerService.rejectRentalRequest(requestId)
    toast.add({
      severity: 'info',
      summary: t('provider.home.toast.rentalRequestDenied'),
      detail: t('provider.home.toast.rentalDenySuccess'),
      life: 3000,
    })
    await loadProviderData()
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('provider.home.toast.failedToDenyRental')
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

const handleAcceptMaintenanceRequest = async (requestId) => {
  try {
    await providerService.acceptMaintenanceRequest(requestId)
    toast.add({
      severity: 'success',
      summary: t('provider.home.toast.maintenanceAccepted'),
      detail: t('provider.home.toast.maintenanceAcceptSuccess'),
      life: 3000,
    })
    await loadProviderData()
  } catch (error) {
    const errorMessage = error.response?.data?.message || t('provider.home.toast.failedToAcceptMaintenance')
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

const goToDetails = () => {
  router.push({ name: 'my-teams' })
}

onMounted(() => {
  loadProviderData()
})
</script>

<style scoped>
.provider-home {
  position: relative;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #2563eb;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.section-note {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
  font-style: italic;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.equipment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.equipment-card :deep(.p-card-body) {
  padding: 1rem;
}

.equipment-card :deep(.p-card-content) {
  padding: 0;
}

.equipment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.equipment-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.equipment-name {
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin: 0;
  font-size: 0.9rem;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.maintenance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  gap: 1rem;
}

.maintenance-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.maintenance-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.maintenance-client {
  font-size: 0.8rem;
  color: #6b7280;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  background: white;
  border: 1px solid #e5e7eb;
}

.request-card :deep(.p-card-body) {
  padding: 1rem;
}

.request-card :deep(.p-card-content) {
  padding: 0;
}

.request-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.request-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.request-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.request-icon {
  font-size: 3rem;
  color: #2563eb;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem;
  margin: 0;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.request-equipment {
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.request-detail {
  color: #4b5563;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.request-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}

.billing-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.billing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.billing-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.billing-company {
  font-weight: 600;
  color: #1f2937;
}

.billing-amount {
  color: #4b5563;
  font-size: 0.875rem;
}

.nav-arrow {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.3s;
  z-index: 100;
}

.nav-arrow:hover {
  background: #1d4ed8;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.nav-arrow i {
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .nav-arrow {
    bottom: 2rem;
    top: auto;
    right: 2rem;
    transform: none;
  }

  .nav-arrow:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 640px) {
  .provider-home {
    padding: 1rem;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .request-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .request-actions {
    width: 100%;
    flex-direction: row;
  }
}
</style>
