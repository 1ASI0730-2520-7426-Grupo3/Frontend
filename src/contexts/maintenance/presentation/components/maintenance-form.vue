<template>
  <section class="wrap">
    <h1 class="title">{{ $t('maintenance.title') }}</h1>

    <div class="card">
      <div class="field">
        <label>{{ $t('maintenance.form.selectEquipment') }}</label>
        <select v-model="selectedId">
          <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
        </select>
      </div>

      <div class="field">
        <label>{{ $t('maintenance.form.cost') }}</label>
        <input type="text" :value="costLabel" readonly />
      </div>

      <div class="field">
        <label>{{ $t('maintenance.form.selectDate') }}</label>
        <input type="date" v-model="dateStr" />
      </div>

      <button class="btn" :disabled="!canSubmit" @click="submit">
        {{ $t('maintenance.form.request') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { MaintenanceApiService } from '../../infrastructure/maintenance.api-service.js'
import { MaintenanceAssembler } from '../../Domain/maintenance.assembler.js'

const api = new MaintenanceApiService()
const userId = 1

const loading = ref(false)
const equipments = ref([])
const pricing = ref(new Map())
const options = computed(() => MaintenanceAssembler.toEquipmentOptions(equipments.value))

const selectedId = ref(null)
const dateStr = ref(new Date().toISOString().slice(0, 10))

const currentCost = computed(() => pricing.value.get(Number(selectedId.value)) ?? 0)
const costLabel = computed(() => `$${currentCost.value.toFixed(2)}`)
const canSubmit = computed(() => !!selectedId.value && !!dateStr.value && currentCost.value > 0)

async function load() {
  loading.value = true
  try {
    const [eqs, priceMap] = await Promise.all([api.getUserEquipments(userId), api.getPricingMap()])
    equipments.value = eqs
    pricing.value = priceMap
    if (eqs.length) selectedId.value = eqs[0].id
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!canSubmit.value) return
  const payload = MaintenanceAssembler.toCreateResource({
    userId,
    equipmentId: Number(selectedId.value),
    costUSD: currentCost.value,
    selectedDate: dateStr.value,
    type: 'corrective',
    notes: '',
  })
  await api.createRequest(payload)
  alert('Maintenance request created')
}

onMounted(load)
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background: #f8f9fb;
  min-height: 100vh;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 2rem;
  font-family: 'Inter', sans-serif;
}

.card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.1);
  border: 1px solid #eaeaea;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
  font-family: 'Inter', sans-serif;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
  font-size: 0.95rem;
}

select,
input[type='text'],
input[type='date'] {
  height: 44px;
  border: 1px solid #d4d8dd;
  border-radius: 10px;
  padding: 0 0.75rem;
  background-color: #fff;
  color: #222;
  font-size: 0.95rem;
  outline: none;
  transition:
    border 0.2s ease,
    box-shadow 0.2s ease;

  color-scheme: light;
}

select:focus,
input[type='text']:focus,
input[type='date']:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0;
}

input[type='date'] {
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 18px 18px;
  padding-right: 0.6rem;
}

.btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  background: #1976d2;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.2px;
  cursor: pointer;
  border: none;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
}

.btn:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
