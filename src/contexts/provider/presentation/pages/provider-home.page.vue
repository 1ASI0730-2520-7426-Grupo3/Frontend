<template>
  <div class="provider-home">
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- My Gym Equipment Section -->
        <section class="dashboard-section">
          <h2 class="section-title">My Gym Equipment</h2>
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

        <!-- Maintenance Section -->
        <section class="dashboard-section">
          <h2 class="section-title">Maintenance</h2>
          <div class="maintenance-list">
            <div v-for="task in maintenanceTasks" :key="task.id" class="maintenance-item">
              <span class="maintenance-name">{{ task.equipmentName }}</span>
              <Tag
                :value="task.status"
                :severity="
                  task.status === 'Done'
                    ? 'success'
                    : task.status === 'Pending'
                      ? 'danger'
                      : 'warning'
                "
              />
            </div>
          </div>
          <p class="section-note">
            Here, the maintenance tasks for your gym machines will be displayed.
          </p>
        </section>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Requests Section -->
        <section class="dashboard-section">
          <h2 class="section-title">Requests</h2>
          <div class="requests-list">
            <Card v-for="request in maintenanceRequests" :key="request.id" class="request-card">
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
                        <strong>Requested by:</strong><br />{{ request.clientName }}
                      </p>
                      <p class="request-detail">
                        <strong>Time:</strong><br />{{ request.duration }}
                      </p>
                    </div>
                  </div>
                  <div class="request-actions">
                    <Button
                      label="Accept"
                      severity="success"
                      size="small"
                      @click="handleAcceptRequest(request.id)"
                    />
                    <Button
                      label="Deny"
                      severity="danger"
                      size="small"
                      @click="handleDenyRequest(request.id)"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </section>

        <!-- Billing & Payments Section -->
        <section class="dashboard-section">
          <h2 class="section-title">Billing & Payments</h2>
          <div class="billing-list">
            <div v-for="payment in billingPayments" :key="payment.id" class="billing-item">
              <div class="billing-info">
                <span class="billing-company">{{ payment.companyName }}</span>
                <span class="billing-amount">S/. {{ payment.amount.toFixed(2) }}</span>
              </div>
              <Tag
                :value="payment.status"
                :severity="payment.status === 'Received' ? 'success' : 'warning'"
              />
            </div>
          </div>
          <p class="section-note">
            Here, the pending and paid receipts of your clients will be displayed.
          </p>
        </section>
      </div>
    </div>

    <!-- Navigation Arrow -->
    <button class="nav-arrow right" @click="goToDetails" title="View more details">
      <i class="pi pi-arrow-right"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineOptions({
  name: 'ProviderHomePage',
})

const router = useRouter()
const toast = useToast()

const gymEquipment = ref([
  {
    id: 1,
    name: 'Treadmill Pro X',
    image: '/treadmill-pro-x.png',
  },
  {
    id: 2,
    name: 'Stationary Bike GX',
    image: '/stationary-bike-gx.png',
  },
])

const maintenanceTasks = ref([
  {
    id: 1,
    equipmentName: 'Treadmill Pro X',
    status: 'Pending',
  },
  {
    id: 2,
    equipmentName: 'Stationary Bike GX',
    status: 'Done',
  },
])

const maintenanceRequests = ref([
  {
    id: 1,
    equipmentName: 'Treadmill Pro X',
    equipmentImage: '/treadmill-pro-x.png',
    clientName: 'Nahuel Barrera',
    duration: '1 year',
  },
  {
    id: 2,
    equipmentName: 'Stationary Bike GX',
    equipmentImage: '/stationary-bike-gx.png',
    clientName: 'Diego Romero',
    duration: '1 year',
  },
])

const billingPayments = ref([
  {
    id: 1,
    companyName: 'FRITMO CORP',
    amount: 2351.23,
    status: 'Received',
  },
  {
    id: 2,
    companyName: 'COOLPROV S.A.C.',
    amount: 458.5,
    status: 'Pending',
  },
])

const handleAcceptRequest = (requestId) => {
  toast.add({
    severity: 'success',
    summary: 'Request Accepted',
    detail: 'Maintenance request has been accepted',
    life: 3000,
  })
  console.log('Accept request:', requestId)
}

const handleDenyRequest = (requestId) => {
  toast.add({
    severity: 'info',
    summary: 'Request Denied',
    detail: 'Maintenance request has been denied',
    life: 3000,
  })
  console.log('Deny request:', requestId)
}

const goToDetails = () => {
  router.push({ name: 'my-teams' })
}

onMounted(() => {
  // TODO: Fetch data from API
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

/* Section Styles */
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

/* Equipment Grid */
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

/* Maintenance List */
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
}

.maintenance-name {
  font-weight: 500;
  color: #1f2937;
}

/* Requests List */
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

/* Billing List */
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

/* Navigation Arrow */
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
