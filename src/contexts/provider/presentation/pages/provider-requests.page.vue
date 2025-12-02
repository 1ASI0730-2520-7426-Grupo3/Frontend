<template>
  <div class="provider-requests-page">
    <h1 class="page-title">{{ t('provider.requests.title') }}</h1>

    <div v-if="loading" class="loading-state">{{ t('provider.requests.loading') }}</div>

    <div v-else-if="requests.length === 0" class="empty-state">
      <p>{{ t('provider.requests.empty') }}</p>
    </div>

    <div v-else class="requests-grid">
      <div v-for="request in requests" :key="request.id" class="request-card">
        <!-- Plan Limit Warning Badge -->
        <div
          v-if="request.clientAtLimit"
          class="limit-warning-badge"
          :title="t('provider.requests.toast.clientPlanLimitReached')"
        >
          <i class="pi pi-exclamation-triangle"></i>
          {{ t('provider.requests.details.planLimitReached') }}
        </div>

        <div class="request-image">
          <img :src="request.equipmentImage" :alt="request.equipmentName" />
        </div>
        <h3 class="equipment-name">{{ request.equipmentName }}</h3>
        <div class="request-details">
          <p>
            <strong>{{ t('provider.requests.details.requestedBy') }}</strong
            ><br />{{ request.clientName }}
          </p>
          <p>
            <strong>{{ t('provider.requests.details.time') }}</strong
            ><br />{{ request.duration }}
          </p>
          <p v-if="request.clientUsage">
            <strong>{{ t('provider.requests.details.clientUsage') }}</strong
            ><br />{{ request.clientUsage.currentUsage }} / {{ request.clientUsage.planLimit }}
            {{ request.clientUsage.usageType }}
          </p>
        </div>
        <div class="request-actions">
          <Button
            :label="t('provider.requests.actions.accept')"
            severity="success"
            @click="handleAccept(request.id)"
            class="action-button"
            :disabled="request.clientAtLimit"
          />
          <Button
            :label="t('provider.requests.actions.deny')"
            severity="danger"
            @click="handleDeny(request.id)"
            class="action-button"
          />
        </div>
      </div>
    </div>

    <!-- Back Navigation Arrow -->
    <button class="nav-arrow left" @click="goBack" :title="t('provider.requests.actions.goBack')">
      <i class="pi pi-arrow-left"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { ProviderApiService } from '@/contexts/provider/infrastructure/provider-api.service'
import { ProfileApiService } from '@/contexts/profile/infrastructure/profile-api.service.js'
import { http } from '@/shared-kernel/infrastructure/http'

defineOptions({
  name: 'ProviderRequestsPage',
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const providerService = new ProviderApiService()
const profileService = new ProfileApiService()

const requests = ref([])
const loading = ref(true)

const loadRequests = async () => {
  try {
    loading.value = true
    const rentalRequests = await providerService.getPendingRentalRequests()

    // Fetch usage statistics for each client in parallel
    const requestsWithUsage = await Promise.all(
      rentalRequests.map(async (req) => {
        let clientUsage = null
        let clientAtLimit = false

        try {
          // Fetch client's usage statistics
          clientUsage = await profileService.getUserUsageStatistics(req.clientId)
          clientAtLimit = clientUsage.currentUsage >= clientUsage.planLimit
        } catch (err) {
          console.error(`Error fetching usage for client ${req.clientId}:`, err)
          // Continue without usage data if it fails
        }

        return {
          id: req.id,
          clientId: req.clientId,
          equipmentName:
            req.equipmentName || `${t('provider.requests.details.equipment')} #${req.equipmentId}`,
          equipmentImage: req.equipmentImage || '/placeholder-equipment.png',
          clientName: req.clientEmail || `Client #${req.clientId}`,
          duration: '1 year',
          clientUsage,
          clientAtLimit,
        }
      }),
    )

    requests.value = requestsWithUsage
  } catch (err) {
    console.error('Error loading requests:', err)

    // If backend returns a localized error message, use it
    const errorMessage = err.response?.data?.message || t('provider.requests.toast.failedToLoad')

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

const handleAccept = async (requestId) => {
  try {
    // Find the request to get the client ID
    const request = requests.value.find((req) => req.id === requestId)
    if (!request || !request.clientId) {
      throw new Error('Request not found or missing client ID')
    }

    // Check client's plan limit before approving
    try {
      const clientUsage = await profileService.getUserUsageStatistics(request.clientId)

      // If client has reached their plan limit, block the approval
      if (clientUsage.currentUsage >= clientUsage.planLimit) {
        toast.add({
          severity: 'warn',
          summary: t('provider.requests.toast.clientPlanLimitReached'),
          detail: t('provider.requests.toast.clientPlanLimitExceeded', {
            limit: clientUsage.planLimit,
            current: clientUsage.currentUsage,
          }),
          life: 6000,
        })
        return // Don't proceed with approval
      }
    } catch (usageErr) {
      console.error('Error checking client usage:', usageErr)
      // If we can't verify the limit, show a warning but allow provider to decide
      toast.add({
        severity: 'info',
        summary: t('common.warning'),
        detail: 'Could not verify client plan limit. Proceed with caution.',
        life: 4000,
      })
    }

    // Proceed with approval if limit not reached
    await providerService.approveRentalRequest(requestId)
    toast.add({
      severity: 'success',
      summary: t('provider.requests.toast.requestAccepted'),
      detail: t('provider.requests.toast.approvalSuccess'),
      life: 3000,
    })
    await loadRequests()
  } catch (err) {
    console.error('Error accepting request:', err)

    // If backend returns a localized error message, use it
    const errorMessage = err.response?.data?.message || t('provider.requests.toast.failedToAccept')

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

const handleDeny = async (requestId) => {
  try {
    await providerService.rejectRentalRequest(requestId)
    toast.add({
      severity: 'info',
      summary: t('provider.requests.toast.requestDenied'),
      detail: t('provider.requests.toast.rejectionSuccess'),
      life: 3000,
    })
    await loadRequests()
  } catch (err) {
    console.error('Error denying request:', err)

    // If backend returns a localized error message, use it
    const errorMessage = err.response?.data?.message || t('provider.requests.toast.failedToReject')

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

const goBack = () => {
  router.push({ name: 'provider-home' })
}

onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.provider-requests-page {
  position: relative;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-title {
  color: #2563eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding-bottom: 4rem;
}

.request-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
}

.request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.limit-warning-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f59e0b;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.limit-warning-badge i {
  font-size: 0.875rem;
}

.request-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.request-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.equipment-name {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.request-details p {
  margin: 0;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.6;
}

.request-details strong {
  color: #1f2937;
  font-weight: 600;
}

.request-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.action-button {
  flex: 1;
  font-weight: 600;
}

.nav-arrow {
  position: fixed;
  left: 2rem;
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
  .requests-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .nav-arrow {
    bottom: 2rem;
    top: auto;
    left: 2rem;
    transform: none;
  }

  .nav-arrow:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 640px) {
  .provider-requests-page {
    padding: 1rem;
  }

  .requests-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
