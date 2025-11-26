<template>
  <div class="clients-teams-page">
    <div class="page-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- My Clients Section -->
        <section class="page-section">
          <h2 class="section-title">My clients</h2>
          <div class="clients-list">
            <div v-for="client in clients" :key="client.id" class="client-item">
              <span class="client-name">{{ client.name }}</span>
              <span class="client-date">{{ client.date }}</span>
            </div>
          </div>
          <a href="#" @click.prevent="viewClientHistory" class="section-link">
            View client history
          </a>
        </section>

        <!-- Technicians Section -->
        <section class="page-section">
          <h2 class="section-title">Technicians</h2>
          <div class="technicians-list">
            <div v-for="technician in technicians" :key="technician.id" class="technician-item">
              <span class="technician-name">{{ technician.name }}</span>
            </div>
          </div>
          <a href="#" @click.prevent="viewTechnicians" class="section-link">
            View list of technicians
          </a>
        </section>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Work Orders Section -->
        <section class="page-section">
          <h2 class="section-title">Work Orders</h2>
          <div class="work-orders-list">
            <div v-for="order in workOrders" :key="order.id" class="work-order-item">
              <span class="order-text">{{ order.description }}</span>
            </div>
          </div>
          <a href="#" @click.prevent="viewWorkOrders" class="section-link">
            View work orders
          </a>
        </section>
      </div>
    </div>

    <!-- Back Navigation Arrow -->
    <button class="nav-arrow left" @click="goBack" title="Go back to home">
      <i class="pi pi-arrow-left"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, defineOptions } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'MyClientsTeamsPage',
})

const router = useRouter()

const clients = ref([
  {
    id: 1,
    name: 'FitLife Gym S.A.C.',
    date: '15/04/25',
  },
  {
    id: 2,
    name: 'PowerHouse Training SRL',
    date: '10/04/25',
  },
  {
    id: 3,
    name: 'UrbanFit Studio S.A.C.',
    date: '09/04/25',
  },
])

const technicians = ref([
  {
    id: 1,
    name: 'Pinillos Uribe Óscar',
  },
  {
    id: 2,
    name: 'Rodríguez Monteza Juan',
  },
  {
    id: 3,
    name: 'Sanchez Quispe Harold',
  },
])

const workOrders = ref([
  {
    id: 1,
    description: 'Order #00087 - Preventive Maintenance - 15/04/2025',
  },
  {
    id: 2,
    description: 'Order #00086 - Compressor Repair - 10/04/2025',
  },
  {
    id: 3,
    description: 'Order #00085 - General Inspection - 09/04/2025',
  },
])

const viewClientHistory = () => {
  console.log('View client history')
  // TODO: Navigate to client history page
}

const viewTechnicians = () => {
  console.log('View technicians list')
  // TODO: Navigate to technicians page
}

const viewWorkOrders = () => {
  router.push({ name: 'work-orders' })
}

const goBack = () => {
  router.push({ name: 'provider-home' })
}
</script>

<style scoped>
.clients-teams-page {
  position: relative;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Styles */
.page-section {
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

.section-link {
  color: #2563eb;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

.section-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Clients List */
.clients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.client-name {
  font-weight: 500;
  color: #1f2937;
}

.client-date {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Technicians List */
.technicians-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.technician-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.technician-name {
  font-weight: 500;
  color: #1f2937;
}

/* Work Orders List */
.work-orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.work-order-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.order-text {
  color: #1f2937;
  font-size: 0.95rem;
}

/* Navigation Arrow */
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
  .page-grid {
    grid-template-columns: 1fr;
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
  .clients-teams-page {
    padding: 1rem;
  }

  .client-item,
  .technician-item,
  .work-order-item {
    padding: 0.875rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
