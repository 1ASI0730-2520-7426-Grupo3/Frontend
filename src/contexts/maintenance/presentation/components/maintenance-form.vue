<template>
  <section class="wrap">
    <h1 class="title">{{ $t('maintenance.title') }}</h1>

    <div class="card">
      <div class="field">
        <label>{{ $t('maintenance.form.selectEquipment') }}</label>
        <select v-model="selectedId">
          <option v-if="loading" value="" disabled>Loading equipments...</option>
          <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
        </select>
        <div v-if="hasPendingRequest" class="duplicate-warning">
          <i class="pi pi-exclamation-triangle"></i>
          This equipment already has a pending maintenance request. Please select a different equipment.
        </div>
      </div>

      <div class="field">
        <label>{{ $t('maintenance.form.selectDate') }}</label>
        <input type="date" v-model="dateStr" :min="minDate" />
      </div>

      <div class="field">
        <label>Observation / Notes</label>
        <textarea
          v-model="observation"
          rows="3"
          class="text-area"
          placeholder="Describe the issue (e.g., Strange noise, belt broken...)"
        ></textarea>
      </div>

      <button class="btn" :disabled="!canSubmit || isSubmitting" @click="submit">
        <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="margin-right: 8px"></i>
        {{ isSubmitting ? 'Sending...' : $t('maintenance.form.request') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { MaintenanceApiService } from '../../infrastructure/maintenance.api-service.js'
import { MaintenanceAssembler } from '../../Domain/maintenance.assembler.js'

const api = new MaintenanceApiService()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const isSubmitting = ref(false)
const equipments = ref([])
const existingRequests = ref([])

const selectedId = ref(null)
const dateStr = ref(new Date().toISOString().slice(0, 10))
const observation = ref('')

const minDate = new Date().toISOString().slice(0, 10)

const options = computed(() => MaintenanceAssembler.toEquipmentOptions(equipments.value))

const canSubmit = computed(() => !!selectedId.value && !!dateStr.value && !!observation.value)

// Check if selected equipment already has a pending maintenance request
const hasPendingRequest = computed(() => {
  if (!selectedId.value) return false
  return existingRequests.value.some(
    req => req.equipmentId === selectedId.value && req.status.toLowerCase() === 'pending'
  )
})

async function load() {
  loading.value = true
  try {
    const [eqs, requests] = await Promise.all([
      api.getUserEquipments(),
      api.getAllRequests()
    ])

    equipments.value = eqs
    existingRequests.value = requests

    const queryId = route.query.equipmentId
    if (queryId) {
      const found = eqs.find((e) => e.id === Number(queryId))
      if (found) {
        selectedId.value = found.id
      }
    } else if (eqs.length > 0) {
      selectedId.value = eqs[0].id
    }
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load equipments list.' })
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!canSubmit.value) return

  // Check for duplicate pending request
  if (hasPendingRequest.value) {
    toast.add({
      severity: 'warn',
      summary: 'Duplicate Request',
      detail: 'This equipment already has a pending maintenance request.',
      life: 4000
    })
    return
  }

  isSubmitting.value = true

  try {
    const payload = MaintenanceAssembler.toCreateResource({
      equipmentId: selectedId.value,
      selectedDate: dateStr.value,
      notes: observation.value,
    })

    await api.createRequest(payload)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Maintenance request created successfully',
    })

    setTimeout(() => router.push({ name: 'home' }), 1500)
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to create request'
    toast.add({ severity: 'error', summary: 'Error', detail: msg })
  } finally {
    isSubmitting.value = false
  }
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
input[type='date'],
textarea {
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
  width: 100%;
}

select,
input[type='date'] {
  height: 44px;
}

textarea {
  padding: 10px;
  resize: vertical;
  min-height: 80px;
}

select:focus,
input[type='text']:focus,
input[type='date']:focus,
textarea:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.duplicate-warning {
  margin-top: 8px;
  padding: 10px 12px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.duplicate-warning i {
  color: #ffc107;
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
  display: flex;
  justify-content: center;
  align-items: center;
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
