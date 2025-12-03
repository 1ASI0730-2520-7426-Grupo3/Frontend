<template>
  <section class="notifications-container">
    <h1 class="page-title">{{ t('provider.notifications.title') }}</h1>

    <div v-if="loading" class="loading-message">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="error-box">
      <p class="error-title">{{ t('common.error') }}</p>
      <p class="error-detail">{{ error }}</p>
    </div>

    <div v-else class="requests-list">
      <Card v-if="acceptedRequests.length === 0" class="empty-state">
        <template #content>
          <i class="pi pi-inbox empty-icon"></i>
          <h3>{{ t('provider.notifications.empty.title') }}</h3>
          <p>{{ t('provider.notifications.empty.description') }}</p>
        </template>
      </Card>

      <Card v-for="request in acceptedRequests" :key="request.id" class="request-card">
        <template #content>
          <div class="request-header">
            <h3 class="request-title">
              <i class="pi pi-wrench"></i>
              {{ request.equipmentName }}
            </h3>
            <Tag :value="request.status" severity="success" />
          </div>

          <div class="request-details">
            <div class="detail-item client-info">
              <i class="pi pi-user"></i>
              <div class="client-details">
                <span class="client-label">{{ t('provider.notifications.details.client') }}:</span>
                <span class="client-name">{{ request.clientName }}</span>
                <span class="client-email">{{ request.clientEmail }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="request.observation">
              <i class="pi pi-info-circle"></i>
              <span>
                <strong>{{ t('provider.notifications.details.observation') }}:</strong>
                {{ request.observation }}
              </span>
            </div>

            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <span>
                {{ t('provider.notifications.details.scheduled') }}:
                {{ formatDate(request.selectedDate) }}
              </span>
            </div>

            <div class="detail-item">
              <i class="pi pi-check-circle"></i>
              <span class="accepted-label">
                {{ t('provider.notifications.details.acceptedByYou') }}
              </span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { ProviderApiService } from '../../infrastructure/provider-api.service'

// eslint-disable-next-line no-unused-vars
const toast = useToast()
const { t, locale } = useI18n()
const providerService = new ProviderApiService()

const acceptedRequests = ref([])
const loading = ref(true)
const error = ref(null)

const loadAcceptedMaintenanceRequests = async () => {
  loading.value = true
  error.value = null
  try {
    const requests = await providerService.getMyMaintenanceRequests()

    // Backend already includes client info (clientName, clientEmail) in the response
    acceptedRequests.value = requests.map(req => {
      console.log('Processing request:', req)
      return {
        id: req.id,
        equipmentName: req.equipmentName || `Equipment #${req.equipmentId}`,
        clientId: req.requestedByUserId,
        clientName: req.clientName || `User #${req.requestedByUserId}`,
        clientEmail: req.clientEmail || 'No email',
        observation: req.observation || '',
        selectedDate: req.selectedDate,
        status: req.status,
      }
    })
    // eslint-disable-next-line no-unused-vars
  } catch (err) { /* empty */ } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadAcceptedMaintenanceRequests()
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.request-title i {
  color: #2563eb;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #4b5563;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.detail-item i {
  color: #2563eb;
  font-size: 1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.client-info {
  background-color: #eff6ff;
  border-left: 3px solid #2563eb;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-label {
  font-weight: 600;
  color: #1f2937;
}

.client-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e40af;
}

.client-email {
  font-size: 0.875rem;
  color: #4b5563;
}

.accepted-label {
  color: #16a34a;
  font-weight: 600;
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
