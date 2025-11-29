<template>
  <div class="add-equipment-container">
    <div class="add-equipment-content">
      <h1 class="page-title">Add Equipment</h1>

      <form @submit.prevent="handleSubmit" class="equipment-form">
        <div class="form-grid">
          <div class="form-field">
            <label for="name">Name:</label>
            <InputText
              id="name"
              v-model="formData.name"
              :class="{ 'p-invalid': submitted && !formData.name }"
              placeholder="Enter equipment name"
            />
            <small v-if="submitted && !formData.name" class="p-error">Name is required</small>
          </div>

          <div class="form-field">
            <label for="type">Type:</label>
            <InputText
              id="type"
              v-model="formData.type"
              :class="{ 'p-invalid': submitted && !formData.type }"
              placeholder="e.g., treadmill"
            />
            <small v-if="submitted && !formData.type" class="p-error">Type is required</small>
          </div>

          <div class="form-field">
            <label for="model">Model:</label>
            <InputText
              id="model"
              v-model="formData.model"
              :class="{ 'p-invalid': submitted && !formData.model }"
              placeholder="Enter model"
            />
            <small v-if="submitted && !formData.model" class="p-error">Model is required</small>
          </div>

          <div class="form-field">
            <label for="manufacturer">Manufacturer:</label>
            <InputText
              id="manufacturer"
              v-model="formData.manufacturer"
              :class="{ 'p-invalid': submitted && !formData.manufacturer }"
              placeholder="Enter manufacturer"
            />
            <small v-if="submitted && !formData.manufacturer" class="p-error"
              >Manufacturer is required</small
            >
          </div>

          <div class="form-field">
            <label for="serialNumber">Serial number:</label>
            <InputText
              id="serialNumber"
              v-model="formData.serialNumber"
              :class="{ 'p-invalid': submitted && !formData.serialNumber }"
              placeholder="Enter unique serial number"
            />
            <small v-if="submitted && !formData.serialNumber" class="p-error"
              >Serial number is required</small
            >
          </div>

          <div class="form-field">
            <label for="code">Code:</label>
            <InputText
              id="code"
              v-model="formData.code"
              :class="{ 'p-invalid': submitted && !formData.code }"
              placeholder="Enter internal code"
            />
            <small v-if="submitted && !formData.code" class="p-error">Code is required</small>
          </div>

          <div class="form-field">
            <label for="installationDate">Installation Date:</label>
            <Calendar
              id="installationDate"
              v-model="formData.installationDate"
              dateFormat="yy-mm-dd"
              placeholder="Select date"
              showIcon
            />
          </div>

          <div class="form-field">
            <label for="powerWatts">Power (Watts):</label>
            <InputNumber
              id="powerWatts"
              v-model="formData.powerWatts"
              :min="0"
              placeholder="e.g., 1500"
            />
          </div>

          <div class="form-field">
            <label for="locationName">Location Name:</label>
            <InputText
              id="locationName"
              v-model="formData.locationName"
              placeholder="e.g., Cardio Zone"
            />
          </div>

          <div class="form-field">
            <label for="locationAddress">Location Address:</label>
            <InputText
              id="locationAddress"
              v-model="formData.locationAddress"
              placeholder="e.g., Main Hall, Floor 1"
            />
          </div>

          <div class="form-field">
            <label for="image">Image URL:</label>
            <InputText id="image" v-model="formData.image" placeholder="http://..." />
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            label="Add"
            icon="pi pi-check"
            :loading="loading"
            class="submit-button"
          />
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            @click="handleCancel"
            class="cancel-button"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import { EquipmentApiService } from '../../infrastructure/equipment-api.service.js'

defineOptions({
  name: 'AddEquipmentPage',
})

const router = useRouter()
const toast = useToast()
const equipmentService = new EquipmentApiService()

const formData = ref({
  name: '',
  type: '',
  model: '',
  manufacturer: '',
  serialNumber: '',
  code: '',
  installationDate: null,
  powerWatts: null,
  locationName: '',
  locationAddress: '',
  image: '',
})

const submitted = ref(false)
const loading = ref(false)

const validateForm = () => {
  return (
    formData.value.name &&
    formData.value.type &&
    formData.value.model &&
    formData.value.manufacturer &&
    formData.value.serialNumber &&
    formData.value.code
  )
}

const handleSubmit = async () => {
  submitted.value = true

  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields',
      life: 3000,
    })
    return
  }

  loading.value = true

  try {
    const payload = {
      name: formData.value.name,
      type: formData.value.type,
      model: formData.value.model,
      manufacturer: formData.value.manufacturer,
      serialNumber: formData.value.serialNumber,
      code: formData.value.code,
      installationDate: formData.value.installationDate
        ? new Date(formData.value.installationDate).toISOString()
        : new Date().toISOString(),
      powerWatts: formData.value.powerWatts || 0,
      locationName: formData.value.locationName || 'General',
      locationAddress: formData.value.locationAddress || 'Main Building',
      image: formData.value.image || null,
    }

    console.log('Sending payload:', payload)

    await equipmentService.createEquipment(payload)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Equipment added successfully',
      life: 3000,
    })

    setTimeout(() => {
      router.push({ name: 'my-machines' })
    }, 1000)
  } catch (error) {
    console.error('Error adding equipment:', error)
    const msg = error.response?.data?.message || 'Failed to add equipment. Please check your data.'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: msg,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.add-equipment-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
}

.add-equipment-content {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  color: #2563eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.equipment-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-calendar),
.form-field :deep(.p-inputnumber) {
  width: 100%;
}

.form-field :deep(.p-inputtext.p-invalid) {
  border-color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
}

.submit-button {
  background-color: #2563eb;
  border-color: #2563eb;
  padding: 0.75rem 2.5rem;
  font-weight: 600;
}

.submit-button:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.cancel-button {
  padding: 0.75rem 2.5rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .add-equipment-container {
    padding: 1rem;
  }

  .add-equipment-content {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
