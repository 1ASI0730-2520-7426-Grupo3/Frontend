<template>
  <div class="provider-requests-page">
    <h1 class="page-title">Machine Requests</h1>

    <div v-if="loading" class="loading-state">Loading requests...</div>

    <div v-else-if="requests.length === 0" class="empty-state">
      <p>No pending rental requests at the moment.</p>
    </div>

    <div v-else class="requests-grid">
      <div v-for="request in requests" :key="request.id" class="request-card">
        <div class="request-image">
          <img :src="request.equipmentImage" :alt="request.equipmentName" />
        </div>
        <h3 class="equipment-name">{{ request.equipmentName }}</h3>
        <div class="request-details">
          <p><strong>Requested by:</strong><br />{{ request.clientName }}</p>
          <p><strong>Time:</strong><br />{{ request.duration }}</p>
        </div>
        <div class="request-actions">
          <Button
            label="Accept"
            severity="success"
            @click="handleAccept(request.id)"
            class="action-button"
          />
          <Button
            label="Deny"
            severity="danger"
            @click="handleDeny(request.id)"
            class="action-button"
          />
        </div>
      </div>
    </div>

    <!-- Back Navigation Arrow -->
    <button class="nav-arrow left" @click="goBack" title="Go back">
      <i class="pi pi-arrow-left"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { ProviderApiService } from '@/contexts/provider/infrastructure/provider-api.service'

defineOptions({
  name: 'ProviderRequestsPage',
})

const router = useRouter()
const toast = useToast()
const providerService = new ProviderApiService()

const requests = ref([])
const loading = ref(true)

const loadRequests = async () => {
  try {
    loading.value = true
    const rentalRequests = await providerService.getPendingRentalRequests()

    requests.value = rentalRequests.map((req) => ({
      id: req.id,
      equipmentName: req.equipmentName || `Equipment #${req.equipmentId}`,
      equipmentImage: req.equipmentImage || '/placeholder-equipment.png',
      clientName: req.clientEmail || `Client #${req.clientId}`,
      duration: '1 year',
    }))
  } catch (error) {
    console.error('Error loading requests:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load rental requests',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleAccept = async (requestId) => {
  try {
    await providerService.approveRentalRequest(requestId)
    toast.add({
      severity: 'success',
      summary: 'Request Accepted',
      detail: 'Rental request approved and invoice created',
      life: 3000,
    })
    await loadRequests()
  } catch (error) {
    console.error('Error accepting request:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to accept request',
      life: 3000,
    })
  }
}

const handleDeny = async (requestId) => {
  try {
    await providerService.rejectRentalRequest(requestId)
    toast.add({
      severity: 'info',
      summary: 'Request Denied',
      detail: 'Rental request has been rejected',
      life: 3000,
    })
    await loadRequests()
  } catch (error) {
    console.error('Error denying request:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reject request',
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
}

.request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
