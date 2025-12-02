<template>
  <section class="panel">
    <h2 class="panel__title">{{ t('rentals.title') }}</h2>

    <!-- Plan Limit Alert -->
    <Message v-if="isPlanLimitReached" severity="warn" :closable="false" class="plan-limit-alert">
      <template #default>
        <div class="alert-content">
          <strong>{{ t('rentals.alert.planLimitReached') }}</strong>
          <p>{{ t('rentals.alert.planLimitMessage', { current: usageStatistics?.currentUsage, limit: usageStatistics?.planLimit }) }}</p>
          <router-link to="/profile" class="upgrade-link">
            {{ t('rentals.alert.upgradePlan') }}
          </router-link>
        </div>
      </template>
    </Message>

    <div v-if="isLoading" class="loading-message">{{ t('rentals.loading') }}</div>

    <div v-else-if="error" class="error-box">
      <p class="error-title">{{ t('common.error') }}</p>
      <p class="error-detail">{{ error }}</p>
    </div>

    <div v-else class="card-container">
      <div v-for="machine in rentMachines" :key="machine.id" class="machine-unit">
        <MachineCard
          :machineId="machine.id"
          :img="machine.image || 'https://placehold.co/400x300/e0e0e0/ffffff?text=No+Image'"
          :title="machine.name"
          :subtitle="machine.getFormattedPrice()"
          :isPrice="true"
        />

        <button
          @click="handleRentRequest(machine)"
          class="request-button"
          :disabled="isPlanLimitReached"
          :class="{ 'request-button-disabled': isPlanLimitReached }"
        >
          {{ t('rentals.requestButton') }}
        </button>
      </div>

      <p v-if="rentMachines.length === 0" class="no-data-message">
        {{ t('rentals.noMachines') }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Message from 'primevue/message'

import MachineCard from '@/shared-kernel/presentation/ui/components/machine-card.component.vue'

import { RentApiService } from '../../infrastructure/rent.api.service.js'
import { ProfileApiService } from '@/contexts/profile/infrastructure/profile-api.service.js'
import { AuthApiService } from '@/contexts/auth/infrastructure/auth-api.service.js'

const toast = useToast()
const { t } = useI18n()
const rentService = new RentApiService()
const profileService = new ProfileApiService()
const authService = new AuthApiService()

const rentMachines = ref([])
const isLoading = ref(true)
const error = ref(null)
const usageStatistics = ref(null)

// Computed property to check if plan limit is reached
const isPlanLimitReached = computed(() => {
  if (!usageStatistics.value) return false
  return usageStatistics.value.currentUsage >= usageStatistics.value.planLimit
})

const fetchRentMachines = async () => {
  isLoading.value = true
  error.value = null
  try {
    rentMachines.value = await rentService.getRentalCatalog()
  } catch (err) {
    console.error('Error fetching rental catalog:', err)
    error.value = t('rentals.errorLoadingCatalog')
  } finally {
    isLoading.value = false
  }
}

const handleRentRequest = async (machine) => {
  try {
    const clientId = localStorage.getItem('userId')
    if (!clientId) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('rentals.toast.mustBeLoggedIn'),
        life: 3000,
      })
      return
    }

    // Check plan limit before making request
    if (isPlanLimitReached.value) {
      toast.add({
        severity: 'warn',
        summary: t('rentals.toast.planLimitReached'),
        detail: t('rentals.toast.planLimitExceeded', { limit: usageStatistics.value.planLimit }),
        life: 5000,
      })
      return
    }

    console.log(`Requesting rental for: ${machine.name}`)
    await rentService.createRentalRequest(machine.id, parseInt(clientId))

    toast.add({
      severity: 'success',
      summary: t('rentals.toast.requestSent'),
      detail: t('rentals.toast.requestSuccess', { name: machine.name }),
      life: 3000,
    })
  } catch (err) {
    console.error('Error creating rental request:', err)

    // If backend returns a localized error message, use it
    const errorMessage = err.response?.data?.message || t('rentals.toast.couldNotSubmit')

    toast.add({
      severity: 'error',
      summary: t('rentals.toast.requestFailed'),
      detail: errorMessage,
      life: 3000,
    })
  }
}

onMounted(async () => {
  // Fetch rental machines
  fetchRentMachines()

  // Fetch user usage statistics
  try {
    const userId = authService.getCurrentUserId()
    if (userId) {
      usageStatistics.value = await profileService.getUserUsageStatistics(userId)
      console.log('User usage statistics:', usageStatistics.value)
    }
  } catch (err) {
    console.error('Error fetching usage statistics:', err)
    // Don't block the page if usage stats fail to load
  }
})
</script>

<style scoped>
.panel {
  background: #fdfdfd;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  min-height: 80vh;
  margin: 20px auto;
  max-width: 1200px;
}

.panel__title {
  margin-bottom: 25px;
  color: #3b82f6;
  font-size: 2rem;
  font-weight: bold;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 10px;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.machine-unit {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.machine-unit > :deep(.card) {
  flex-grow: 1;
  margin-bottom: 0;
  border-radius: 12px;
}

.request-button {
  margin-top: 15px;
  width: 100%;
  padding: 12px 15px;
  background-color: #10b981;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.request-button:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.request-button:disabled,
.request-button-disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

.request-button:disabled:hover,
.request-button-disabled:hover {
  background-color: #9ca3af;
  transform: none;
  box-shadow: none;
}

.loading-message,
.no-data-message {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.1rem;
}

.error-box {
  background: #fee2e2;
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.plan-limit-alert {
  margin-bottom: 20px;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-content strong {
  font-size: 1.1rem;
  color: #d97706;
}

.alert-content p {
  margin: 0;
  color: #92400e;
}

.upgrade-link {
  color: #0ea5e9;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.upgrade-link:hover {
  color: #0284c7;
  text-decoration: underline;
}
</style>
