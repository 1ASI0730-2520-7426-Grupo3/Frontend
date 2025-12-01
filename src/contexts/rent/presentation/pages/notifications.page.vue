<template>
  <section class="notifications-container">
    <h1 class="page-title">{{ t('rentals.notifications.title') }}</h1>

    <div v-if="loading" class="loading-message">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="error-box">
      <p class="error-title">{{ t('common.error') }}</p>
      <p class="error-detail">{{ error }}</p>
    </div>

    <div v-else class="requests-list">
      <Card v-if="rentalRequests.length === 0" class="empty-state">
        <template #content>
          <i class="pi pi-inbox empty-icon"></i>
          <h3>{{ t('rentals.notifications.empty.title') }}</h3>
          <p>{{ t('rentals.notifications.empty.description') }}</p>
          <Button
            :label="t('rentals.notifications.empty.button')"
            icon="pi pi-search"
            @click="goToRentals"
          />
        </template>
      </Card>

      <Card v-for="request in rentalRequests" :key="request.id" class="request-card">
        <template #content>
          <div class="request-header">
            <h3 class="request-title">{{ t('rentals.notifications.details.equipment') }} #{{ request.equipmentId }}</h3>
            <Tag
              :value="getStatusLabel(request.status)"
              :severity="getStatusSeverity(request.status)"
            />
          </div>

          <div class="request-details">
            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ t('rentals.notifications.details.requested') }} {{ formatDate(request.requestDate) }}</span>
            </div>

            <div class="detail-item">
              <i class="pi pi-dollar"></i>
              <span>{{ t('rentals.notifications.details.monthlyPrice') }} ${{ request.monthlyPrice }}</span>
            </div>

            <div v-if="request.notes" class="detail-item">
              <i class="pi pi-info-circle"></i>
              <span>{{ request.notes }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { RentApiService } from '../../infrastructure/rent.api.service.js'

const router = useRouter()
const toast = useToast()
const { t, locale } = useI18n()
const rentService = new RentApiService()

const rentalRequests = ref([])
const loading = ref(true)
const error = ref(null)

const loadRentalRequests = async () => {
  loading.value = true
  error.value = null
  try {
    const clientId = localStorage.getItem('userId')
    if (!clientId) {
      error.value = t('rentals.notifications.mustBeLoggedIn')
      return
    }

    rentalRequests.value = await rentService.getRentalRequestsByClientId(parseInt(clientId))
  } catch (err) {
    console.error('Error loading rental requests:', err)

    // If backend returns a localized error message, use it
    const errorMessage = err.response?.data?.message || t('rentals.notifications.failedToLoad')
    error.value = errorMessage

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('rentals.notifications.couldNotLoad'),
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  // Use current locale for date formatting
  return new Date(dateString).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusLabel = (status) => {
  const statusKey = status.toLowerCase()
  return t(`rentals.status.${statusKey}`, status)
}

const getStatusSeverity = (status) => {
  const severities = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info',
    cancelled: 'secondary',
  }
  return severities[status.toLowerCase()] || 'secondary'
}

const goToRentals = () => {
  router.push({ name: 'rent' })
}

onMounted(() => {
  loadRentalRequests()
})
</script>

<style scoped>
.notifications-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc;
}

.page-title {
  color: #2563eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-box {
  background: #fee2e2;
  color: #ef4444;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
}

.error-title {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.error-detail {
  margin: 0;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.request-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.request-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.request-card :deep(.p-card-content) {
  padding: 0;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.request-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
}

.detail-item i {
  color: #2563eb;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-state :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

@media (max-width: 768px) {
  .notifications-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
