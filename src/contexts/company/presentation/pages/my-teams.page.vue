<template>
  <div class="my-teams-page">
    <div class="my-teams-container">
      <div class="my-teams-content">
        <!-- Left Section: My Machines -->
        <section class="machines-section">
          <h2 class="section-title">My machines</h2>

          <div v-if="isLoadingMachines" class="loading-state">
            <p>Loading equipment...</p>
          </div>

          <div v-else-if="machinesError" class="error-state">
            <p>Error loading machines: {{ machinesError.message }}</p>
            <button @click="fetchCompanyMachines" class="reload-button">Reload</button>
          </div>

          <div v-else class="machines-grid">
            <MachineCard
              v-for="machine in companyMachines"
              :key="machine.id"
              :img="machine.img"
              :title="machine.name"
              :machine-id="machine.id"
            />
            <p v-if="companyMachines.length === 0" class="empty-message">
              No equipment found for this company.
            </p>
          </div>
        </section>

        <section class="maintenance-section">
          <h2 class="section-title">Maintenance</h2>

          <div v-if="isLoadingRequests" class="loading-state">
            <p>Loading maintenance requests...</p>
          </div>

          <div v-else-if="requestsError" class="error-state">
            <p>Error loading requests: {{ requestsError.message }}</p>
            <button @click="fetchMaintenanceRequests" class="reload-button">Reload</button>
          </div>

          <div v-else class="maintenance-list">
            <MaintenanceRequestCard
              v-for="request in maintenanceRequests"
              :key="request.id"
              :request-id="request.id"
              :equipment-name="request.equipment?.name || 'Unknown Equipment'"
              :equipment-image="getEquipmentImage(request.equipment)"
              :client-name="request.client?.name || 'Unknown Client'"
              :status="formatStatus(request.status)"
              @submit="handleSubmitRequest"
            />
            <p v-if="maintenanceRequests.length === 0" class="empty-message">
              No maintenance requests found.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MachineCard from '@/shared-kernel/presentation/ui/components/machine-card.component.vue'
import MaintenanceRequestCard from '../components/maintenance-request-card.component.vue'
import { CompanyApiService } from '../../infrastructure/company-api.service.js'

const api = new CompanyApiService()

const COMPANY_ID = 1

const companyMachines = ref([])
const isLoadingMachines = ref(true)
const machinesError = ref(null)

const maintenanceRequests = ref([])
const isLoadingRequests = ref(true)
const requestsError = ref(null)

/**
 * Fetch all equipment for the company
 */
const fetchCompanyMachines = async () => {
  isLoadingMachines.value = true
  machinesError.value = null

  try {
    const machines = await api.getCompanyEquipment(COMPANY_ID)

    companyMachines.value = machines.map((machine) => ({
      id: machine.id,
      name: machine.name,
      img: machine.image || 'https://placehold.co/400x300/4169e1/ffffff?text=No+Image',
      model: machine.model,
    }))
  } catch (error) {
    console.error('Error fetching company machines:', error)
    machinesError.value = error
  } finally {
    isLoadingMachines.value = false
  }
}

/**
 * Fetch all maintenance requests for the company's equipment
 */
const fetchMaintenanceRequests = async () => {
  isLoadingRequests.value = true
  requestsError.value = null

  try {
    const requests = await api.getCompanyMaintenanceRequests(COMPANY_ID)
    maintenanceRequests.value = requests
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    requestsError.value = error
  } finally {
    isLoadingRequests.value = false
  }
}

/**
 * Get equipment image URL
 */
const getEquipmentImage = (equipment) => {
  if (!equipment) return 'https://placehold.co/400x300/4169e1/ffffff?text=Equipment'
  if (equipment.image) return equipment.image
  return 'https://placehold.co/400x300/4169e1/ffffff?text=No+Image'
}

/**
 * Format status for display
 */
const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Handle submit maintenance request
 */
const handleSubmitRequest = (requestId) => {
  console.log('Submit maintenance request:', requestId)
  // TODO: Implement submission logic
  alert(`Submitting maintenance request #${requestId}`)
}

onMounted(() => {
  fetchCompanyMachines()
  fetchMaintenanceRequests()
})
</script>

<style scoped>
.my-teams-page {
  background-color: #f8fafc;
  min-height: calc(100vh - 200px);
}

.my-teams-container {
  padding: 40px 80px;
}

.my-teams-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.machines-section,
.maintenance-section {
  background: white;
  border-radius: 14px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  color: #3b82f6;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.machines-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state,
.error-state,
.empty-message {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 1rem;
}

.error-state p {
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 12px;
}

.reload-button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reload-button:hover {
  background-color: #2563eb;
}

.empty-message {
  grid-column: 1 / -1;
  font-style: italic;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .my-teams-container {
    padding: 30px 60px;
  }

  .my-teams-content {
    gap: 30px;
  }
}

@media (max-width: 1024px) {
  .my-teams-container {
    padding: 30px 40px;
  }

  .my-teams-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .machines-section,
  .maintenance-section {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .my-teams-container {
    padding: 20px;
  }

  .machines-section,
  .maintenance-section {
    padding: 20px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .machines-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .my-teams-container {
    padding: 16px;
  }

  .machines-section,
  .maintenance-section {
    padding: 16px;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
}
</style>
