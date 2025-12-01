<template>
  <div class="work-orders-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('provider.workOrders.title') }}</h1>
      <Button
        :label="t('provider.workOrders.newOrder')"
        icon="pi pi-plus"
        @click="handleNewWorkOrder"
        class="new-order-button"
      />
    </div>

    <div class="work-orders-list">
      <Card v-for="order in workOrders" :key="order.id" class="work-order-card">
        <template #content>
          <div class="order-content">
            <div class="order-field">
              <span class="field-label">{{ t('provider.workOrders.fields.date') }}</span>
              <span class="field-value">{{ order.date }}</span>
            </div>

            <div class="order-field">
              <span class="field-label">{{ t('provider.workOrders.fields.technician') }}</span>
              <span class="field-value">{{ order.technician }}</span>
            </div>

            <div class="order-field">
              <span class="field-label">{{ t('provider.workOrders.fields.equipment') }}</span>
              <div class="equipment-status">
                <span class="field-value">{{ order.equipment }}</span>
                <Tag
                  :value="order.status"
                  :severity="getStatusSeverity(order.status)"
                  class="status-tag"
                />
              </div>
            </div>

            <div class="order-field">
              <span class="field-label">{{ t('provider.workOrders.fields.description') }}</span>
              <span class="field-value">{{ order.description }}</span>
            </div>

            <div class="order-field">
              <span class="field-label">{{ t('provider.workOrders.fields.location') }}</span>
              <span class="field-value">{{ order.location }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Back Navigation Arrow -->
    <button class="nav-arrow left" @click="goBack" :title="t('provider.workOrders.goBack')">
      <i class="pi pi-arrow-left"></i>
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

defineOptions({
  name: 'WorkOrdersPage',
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const providerService = new ProviderApiService()

const workOrders = ref([])
const loading = ref(true)

// List of available technicians
const technicians = ['Pinillos Uribe Óscar', 'Rodríguez Monteza Juan', 'Sanchez Quispe Harold']

// Helper function to randomly select a technician
const getRandomTechnician = () => {
  const randomIndex = Math.floor(Math.random() * technicians.length)
  return technicians[randomIndex]
}

const loadWorkOrders = async () => {
  try {
    loading.value = true
    const providerId = parseInt(localStorage.getItem('userId'))
    const allRentalRequests = await providerService.getAllRentalRequests()

    // Filter approved rental requests for this provider
    const approvedRentals = allRentalRequests.filter(
      (req) => req.status === 'approved' && req.providerId === providerId,
    )

    // Map approved rental requests to work orders
    workOrders.value = approvedRentals.map((req) => ({
      id: req.id,
      date: new Date(req.updatedDate || req.createdDate).toLocaleDateString('en-GB'),
      technician: getRandomTechnician(),
      equipment: req.equipmentName || `Equipment #${req.equipmentId}`,
      description: `Rental service - ${req.notes || 'Equipment rental agreement'}`,
      location: t('provider.workOrders.values.clientLocation'),
      status: t('provider.workOrders.values.active'),
    }))
  } catch (error) {
    console.error('Error loading work orders:', error)
    const errorMessage =
      error.response?.data?.message || t('provider.workOrders.toast.failedToLoad')
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

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Done':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'In Progress':
      return 'info'
    default:
      return 'secondary'
  }
}

const handleNewWorkOrder = () => {
  // Redirect to requests page where provider can accept rental requests
  router.push({ name: 'provider-requests' })
}

const goBack = () => {
  router.push({ name: 'my-teams' })
}

onMounted(() => {
  loadWorkOrders()
})
</script>

<style scoped>
.work-orders-page {
  position: relative;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  color: #2563eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.new-order-button {
  background-color: #2563eb;
  border-color: #2563eb;
  font-weight: 600;
}

.new-order-button:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.work-orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.work-order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.work-order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.work-order-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.work-order-card :deep(.p-card-content) {
  padding: 0;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.95rem;
}

.field-value {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.5;
}

.equipment-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-tag {
  font-size: 0.875rem;
  font-weight: 600;
}

.nav-arrow {
  position: fixed;
  left: 2rem;
  bottom: 2rem;
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
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.nav-arrow i {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .work-orders-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .new-order-button {
    width: 100%;
  }

  .equipment-status {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .nav-arrow {
    left: 1rem;
    bottom: 1rem;
    width: 45px;
    height: 45px;
  }
}
</style>
