<template>
  <div class="machine-controls-container">
    <h1 class="main-title centered">Machine Controls</h1>
    <h2 class="machine-name">{{ machine.name || 'Cargando Máquina...' }}</h2>

    <div v-if="isLoading" class="text-center p-4">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="4"
        fill="var(--panel)"
        animationDuration=".8s"
        aria-label="Cargando data"
      />
      <p class="text-gray-600 mt-3">Obteniendo detalles de la máquina...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      <p class="font-bold">Error al cargar la máquina</p>
      <p class="text-sm">
        No se pudo obtener la información de la máquina con ID: {{ machineId }}. Asegúrate de que el
        backend esté activo en la ruta correcta.
      </p>
    </div>

    <div
      v-else-if="!machine.id"
      class="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg"
    >
      <p class="font-bold">Máquina no encontrada</p>
      <p class="text-sm">No se encontró la máquina con ID: {{ machineId }}.</p>
    </div>

    <div v-if="machine.id && !isLoading" class="content-grid">
      <div class="panel equipment-control-panel">
        <h3 class="panel__title">Equipment Control</h3>

        <div class="control-section">
          <p class="control-label">Power Control</p>
          <div class="power-status-display">
            <span :class="['status-text', isPoweredOn ? 'on' : 'off']">
              {{ isPoweredOn ? 'ON' : 'OFF' }}
            </span>
            <button
              @click="togglePower"
              :class="['power-button', isPoweredOn ? 'on' : 'off']"
              :aria-label="isPoweredOn ? 'Turn Off' : 'Turn On'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="control-divider"></div>

        <div class="control-section">
          <p class="control-label">Speed Level</p>
          <div class="level-display-grid">
            <div class="level-item">
              <span class="level-label">Current:</span>
              <span class="level-value current">{{ currentSpeedLevel }}</span>
            </div>
            <div class="level-item">
              <span class="level-label">Set:</span>
              <span class="level-value set">{{ currentSetLevel }}</span>
            </div>
          </div>

          <p class="range-info">
            Optimal range: {{ machine.controls?.level?.range?.[0] || 'N/A' }}-{{
              machine.controls?.level?.range?.[1] || 'N/A'
            }}
            RPM
          </p>

          <p
            :class="['status-info', machine.controls?.status === 'normal' ? 'normal' : 'attention']"
          >
            Status:
            {{
              machine.controls?.status
                ? machine.controls.status.charAt(0).toUpperCase() + machine.controls.status.slice(1)
                : 'N/A'
            }}
          </p>
        </div>

        <div class="control-divider"></div>

        <div class="analytics-section">
          <h4 class="analytics-title">Performance Analytics</h4>
          <p class="usage-text">Operating Temperature Trend (Past 12h)</p>

          <div class="chart-container">
            <svg viewBox="0 0 300 120" class="line-chart">
              <rect x="20" y="20" width="260" height="40" fill="#ccffcc" opacity="0.4" />
              <text x="285" y="30" font-size="8" fill="#555" text-anchor="end">80°C</text>
              <text x="285" y="60" font-size="8" fill="#555" text-anchor="end">60°C</text>

              <line x1="20" y1="10" x2="20" y2="100" stroke="#ccc" stroke-width="1" />
              <line x1="20" y1="100" x2="290" y2="100" stroke="#ccc" stroke-width="1" />

              <polyline
                :points="getLinePoints(simulatedTempData)"
                fill="none"
                stroke="#4169E1"
                stroke-width="2"
                class="temp-line"
              />

              <polygon
                :points="getAreaPoints(simulatedTempData)"
                fill="#4169E1"
                opacity="0.3"
                class="temp-area"
              />

              <text x="20" y="115" font-size="8" fill="#777">0h</text>
              <text x="150" y="115" font-size="8" fill="#777" text-anchor="middle">6h</text>
              <text x="290" y="115" font-size="8" fill="#777" text-anchor="end">12h</text>
            </svg>
          </div>

          <div class="flex justify-between items-center mt-3">
            <span class="legend-item">
              <span class="legend-color temp-color"></span> Current Temperature
            </span>
            <span class="legend-item">
              <span class="legend-color optimal-color"></span> Optimal Range (60-80°C)
            </span>
          </div>

          <pv-button class="analytics-button mt-4" severity="primary"
            >View Full Analytics</pv-button
          >
        </div>
      </div>

      <div class="panel equipment-info-panel">
        <h3 class="panel__title">Equipment Information</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ machine.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Type:</span>
            <span class="info-value">{{
              machine.type ? machine.type.charAt(0).toUpperCase() + machine.type.slice(1) : 'N/A'
            }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Model:</span>
            <span class="info-value">{{ machine.model }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Manufacturer:</span>
            <span class="info-value">{{ machine.manufacturer }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Serial:</span>
            <span class="info-value">{{ machine.serialNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Code:</span>
            <span class="info-value">{{ machine.code }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Installation Date:</span>
            <span class="info-value">{{
              machine.installationDate
                ? machine.installationDate.split('-').reverse().join('/')
                : 'N/A'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Power:</span>
            <span class="info-value">{{ machine.powerWatts || 'N/A' }} W</span>
          </div>

          <div class="info-item location-item">
            <span class="info-label">Location:</span>
            <span class="info-value">{{ machine.location?.name || 'N/A' }}</span>
          </div>

          <div class="info-item location-item">
            <span class="info-label">Address:</span>
            <span class="info-value">{{ machine.location?.address || 'N/A' }}</span>
          </div>

          <div class="info-item maintenance-item">
            <span class="info-label">Maintenance:</span>
            <div class="maintenance-details">
              <span class="detail-label">Last:</span>
              <span class="detail-value">{{ machine.maintenanceInfo?.last || 'N/A' }}</span>
              <span class="detail-label">Next:</span>
              <span class="detail-value">{{ machine.maintenanceInfo?.next || 'Pending' }}</span>
            </div>
          </div>

          <div class="info-item notes-item">
            <span class="info-label">Notes:</span>
            <span class="info-value notes-text">{{ machine.notes || 'No notes.' }}</span>
          </div>
        </div>
      </div>
    </div>

    <pv-button class="back-button-bottom" @click="router.back()" severity="primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-4 h-4 mr-2"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back to My Machines
    </pv-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { http } from '@/shared-kernel/infrastructure/http.js'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const machineId = computed(() => route.params.id)

const machine = ref({})
const isLoading = ref(true)
const error = ref(null)

const isPoweredOn = ref(false)
const currentSpeedLevel = ref(0)
const currentSetLevel = ref(0)
const simulatedTempData = ref([75, 78, 85, 82, 70, 65, 68])

const fetchMachineData = async (id) => {
  isLoading.value = true
  error.value = null
  machine.value = {}

  if (!id) {
    isLoading.value = false
    error.value = new Error('Machine ID is missing from route parameters.')
    console.error(error.value.message)
    return
  }

  try {
    const response = await http.get(`/equipments/${id}`)

    machine.value = response.data || {}

    if (machine.value.controls) {
      isPoweredOn.value = machine.value.isPoweredOn ?? false
      currentSpeedLevel.value = machine.value.controls.level?.current ?? 0
      currentSetLevel.value = machine.value.controls.level?.set ?? 0
    } else {
      isPoweredOn.value = machine.value.isPoweredOn ?? false
      currentSpeedLevel.value = 0
      currentSetLevel.value = 0
    }
  } catch (err) {
    console.error(`Error fetching machine ${id}:`, err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (machineId.value) {
    fetchMachineData(machineId.value)
  }
})

watch(machineId, (newId) => {
  if (newId) {
    fetchMachineData(newId)
  }
})

const getLinePoints = (data) => {
  const xMax = 290
  const xMin = 20
  const yMax = 100
  const yMin = 10
  const dataMin = 40
  const dataMax = 100
  const dataRange = dataMax - dataMin
  const viewRangeY = yMax - yMin

  const points = data
    .map((value, index) => {
      const normalizedValue = (value - dataMin) / dataRange
      const y = yMax - normalizedValue * viewRangeY
      const x = xMin + index * ((xMax - xMin) / (data.length - 1))
      return `${x},${y}`
    })
    .join(' ')

  return points
}

const getAreaPoints = (data) => {
  const linePoints = getLinePoints(data)
  const xMax = 290
  const xMin = 20
  const yBottom = 100
  const firstX = xMin
  const lastX = xMax

  return `${linePoints} ${lastX},${yBottom} ${firstX},${yBottom}`
}

const togglePower = () => {
  isPoweredOn.value = !isPoweredOn.value
  console.log(
    `Machine ${machine.value.name} power state toggled to ${isPoweredOn.value ? 'ON' : 'OFF'}`,
  )
}
</script>

<style scoped>
:root {
  --primary: #4169e1;
  --primary-hover: #3558be;
  --secondary: #0077b6;
  --success: #2ecc71;
  --warning: #f39c12;
  --danger: #e74c3c;
  --text-dark: #34495e;
  --text-medium: #7f8c8d;
  --bg: #f8f9fa;
  --card: #ffffff;
  --border-light: #ecf0f1;
  --primary-rgb: 65, 105, 225;
}

.machine-controls-container {
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button-bottom {
  margin: 40px auto 20px auto;
}

.analytics-button {
  width: 100%;
}

.p-button.p-button-primary {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

.main-title {
  color: var(--primary);
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 8px;
  text-align: center;
}

.machine-name {
  color: var(--text-dark);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}

.panel {
  background: var(--card);
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.panel__title {
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
}

.control-section {
  margin-bottom: 25px;
}

.control-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.power-status-display {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-text {
  font-size: 1.8rem;
  font-weight: 800;
  min-width: 60px;
}
.status-text.on {
  color: var(--success);
}
.status-text.off {
  color: var(--danger);
}

.power-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.power-button:hover {
  transform: scale(1.1);
}

.power-button svg {
  color: white;
  transition: all 0.3s ease;
}

.power-button.on {
  background-color: var(--success);
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.4);
}
.power-button.off {
  background-color: var(--danger);
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.4);
}

.level-display-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.analytics-section {
  margin-top: 30px;
}
.analytics-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}
.usage-text {
  font-size: 0.9rem;
  color: var(--text-medium);
  margin-bottom: 15px;
}

.chart-container {
  padding: 10px 0;
  margin-bottom: 0;
  background-color: var(--bg);
  border-radius: 8px;
  overflow: hidden;
}

.line-chart {
  width: 100%;
  height: 140px;
  overflow: visible;
}

.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-dark);
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  display: inline-block;
}
.temp-color {
  background-color: var(--primary);
}
.optimal-color {
  background-color: #ccffcc;
  border: 1px solid #77dd77;
}

.control-divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-medium);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.location-item,
.maintenance-item,
.notes-item {
  grid-column: span 2;
}

.maintenance-details {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.maintenance-details .detail-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
}
.maintenance-details .detail-value {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-dark);
  margin-right: 10px;
}

.notes-text {
  font-style: italic;
  font-weight: 400;
  color: var(--text-medium);
  margin-top: 4px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
}

@media (max-width: 600px) {
  .main-title {
    font-size: 2rem;
  }
  .machine-name {
    font-size: 1.5rem;
  }
  .panel {
    padding: 20px;
  }
  .info-grid {
    gap: 15px 20px;
  }
  .back-button-bottom {
    width: 90%;
  }
}
</style>
