<template>
  <div class="my-machines-container">
    <h1 class="page-title">My Machines</h1>

    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>

    <div v-if="!loading && machines.length === 0" class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <h3>No Machines Yet</h3>
      <p>Add your first equipment to get started</p>
      <Button label="Add Equipment" icon="pi pi-plus" @click="goToAddEquipment" />
    </div>

    <div v-else class="machines-grid">
      <Card v-for="machine in machines" :key="machine.id" class="machine-card">
        <template #content>
          <div class="card-header">
            <button
              class="power-button"
              :class="{ active: machine.isPoweredOn }"
              @click="togglePower(machine.id)"
              :title="machine.isPoweredOn ? 'Power Off' : 'Power On'"
            >
              <i class="pi pi-power-off"></i>
            </button>
            <div class="status-indicator" :class="{ active: machine.isPoweredOn }"></div>
          </div>

          <div class="machine-image-container">
            <img
              :src="machine.image || 'https://placehold.co/400x300/e0e0e0/ffffff?text=No+Image'"
              :alt="machine.name"
              class="machine-image"
            />
          </div>

          <div class="machine-info">
            <h3 class="machine-name">{{ machine.name }}</h3>

            <div class="usage-info">
              <span class="usage-label">Usage Today:</span>
              <span class="usage-value">{{ machine.usage?.todayMinutes || 0 }} min</span>
              <Tag
                :value="machine.isPoweredOn ? 'Active' : 'Inactive'"
                :severity="machine.isPoweredOn ? 'success' : 'secondary'"
                class="status-tag"
              />
            </div>

            <div class="calories-info" v-if="machine.usage?.caloriesToday">
              <span class="calories-label">Calories Burned:</span>
              <span class="calories-value">{{ machine.usage.caloriesToday }} kcal</span>
            </div>

            <div class="location-info">
              <i class="pi pi-map-marker"></i>
              <span v-if="machine.location && typeof machine.location === 'object'">
                {{ machine.location.name }} - {{ machine.location.address }}
              </span>
              <span v-else>
                {{ machine.location || 'Location not set' }}
              </span>
            </div>

            <div class="card-actions">
              <Button
                icon="pi pi-cog"
                label="Control"
                outlined
                size="small"
                @click="goToControls(machine.id)"
                class="control-button"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="add-equipment-section" v-if="machines.length > 0">
      <Button
        label="Add Equipment"
        icon="pi pi-plus"
        @click="goToAddEquipment"
        class="add-equipment-button"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { EquipmentApiService } from '../../infrastructure/equipment-api.service.js'

defineOptions({
  name: 'MyMachinesPage',
})

const router = useRouter()
const toast = useToast()
const equipmentService = new EquipmentApiService()

const machines = ref([])
const loading = ref(true)

// Función para cargar máquinas usando el servicio real
const loadMachines = async () => {
  loading.value = true
  try {
    const clientId = localStorage.getItem('userId')

    // Llamada correcta al servicio conectado al Backend .NET
    const data = await equipmentService.getClientEquipment(clientId)

    machines.value = data
  } catch (error) {
    console.error('Error loading machines:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load machines. Check your connection.',
    })
  } finally {
    loading.value = false
  }
}

// Función para cambiar el estado de encendido
const togglePower = async (machineId) => {
  // 1. Encontrar la máquina localmente
  const machine = machines.value.find((m) => m.id === machineId)
  if (!machine) return

  // 2. Guardar estado anterior por si falla
  const originalState = machine.isPoweredOn
  const newPowerState = !originalState

  try {
    // 3. Actualización optimista (cambiar visualmente antes de que responda el servidor)
    machine.isPoweredOn = newPowerState

    // 4. Preparar payload.
    const updatePayload = {
      name: machine.name,
      code: machine.code,
      powerWatts: machine.powerWatts,
      isPoweredOn: newPowerState,
      activeStatus: machine.activeStatus || 'Normal',
      notes: machine.notes,
      status: machine.status,
      locationName: machine.location?.name || 'Default Area',
      locationAddress: machine.location?.address || 'Default Address',
      image: machine.image,
    }

    // 5. Llamar al servicio
    await equipmentService.updateEquipment(machineId, updatePayload)

    toast.add({
      severity: 'success',
      summary: newPowerState ? 'Powered On' : 'Powered Off',
      detail: `${machine.name} is now ${newPowerState ? 'active' : 'inactive'}`,
      life: 2000,
    })
  } catch (error) {
    console.error('Error toggling power:', error)

    // 6. Revertir cambio si hubo error
    machine.isPoweredOn = originalState

    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Could not update machine status.',
      life: 3000,
    })
  }
}

const goToControls = (machineId) => {
  router.push({ name: 'MachineControls', params: { id: machineId } })
}

const goToAddEquipment = () => {
  router.push({ name: 'add-equipment' })
}

onMounted(() => {
  loadMachines()
})
</script>

<style scoped>
.my-machines-container {
  padding: 2rem;
  max-width: 1400px;
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

.machines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.machine-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.machine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.machine-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.machine-card :deep(.p-card-content) {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.power-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #6b7280;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #6b7280;
}

.power-button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.power-button.active {
  border-color: #10b981;
  color: #10b981;
  background-color: #ecfdf5;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9ca3af;
  transition: background-color 0.3s;
}

.status-indicator.active {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.machine-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  min-height: 200px;
}

.machine-image {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.machine-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.machine-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-align: center;
}

.usage-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.usage-label {
  font-weight: 600;
  color: #4b5563;
}

.usage-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.status-tag {
  font-size: 0.75rem;
}

.calories-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.calories-label {
  font-weight: 600;
  color: #4b5563;
}

.calories-value {
  font-weight: 700;
  color: #ef4444;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.location-info i {
  color: #2563eb;
}

.card-actions {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
}

.control-button {
  flex: 1;
  max-width: 200px;
}

.add-equipment-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.add-equipment-button {
  background-color: #2563eb;
  border-color: #2563eb;
  padding: 0.75rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.add-equipment-button:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  color: #6b7280;
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
  .my-machines-container {
    padding: 1rem;
  }

  .machines-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
