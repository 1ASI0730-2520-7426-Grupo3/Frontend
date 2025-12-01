<template>
  <div class="add-equipment-container">
    <div class="add-equipment-content">
      <h1 class="page-title">{{ $t('equipment.addEquipment.title') }}</h1>

      <form @submit.prevent="handleSubmit" class="equipment-form">
        <div class="form-grid">
          <div class="form-field">
            <label for="name">{{ $t('equipment.addEquipment.form.name') }}</label>
            <InputText
              id="name"
              v-model="formData.name"
              :class="{ 'p-invalid': submitted && !formData.name }"
              :placeholder="$t('equipment.addEquipment.form.namePlaceholder')"
            />
            <small v-if="submitted && !formData.name" class="p-error">{{ $t('equipment.addEquipment.form.nameRequired') }}</small>
          </div>

          <div class="form-field">
            <label for="type">{{ $t('equipment.addEquipment.form.type') }}</label>
            <InputText
              id="type"
              v-model="formData.type"
              :class="{ 'p-invalid': submitted && !formData.type }"
              :placeholder="$t('equipment.addEquipment.form.typePlaceholder')"
            />
            <small v-if="submitted && !formData.type" class="p-error">{{ $t('equipment.addEquipment.form.typeRequired') }}</small>
          </div>

          <div class="form-field">
            <label for="model">{{ $t('equipment.addEquipment.form.model') }}</label>
            <InputText
              id="model"
              v-model="formData.model"
              :class="{ 'p-invalid': submitted && !formData.model }"
              :placeholder="$t('equipment.addEquipment.form.modelPlaceholder')"
            />
            <small v-if="submitted && !formData.model" class="p-error">{{ $t('equipment.addEquipment.form.modelRequired') }}</small>
          </div>

          <div class="form-field">
            <label for="manufacturer">{{ $t('equipment.addEquipment.form.manufacturer') }}</label>
            <InputText
              id="manufacturer"
              v-model="formData.manufacturer"
              :class="{ 'p-invalid': submitted && !formData.manufacturer }"
              :placeholder="$t('equipment.addEquipment.form.manufacturerPlaceholder')"
            />
            <small v-if="submitted && !formData.manufacturer" class="p-error"
              >{{ $t('equipment.addEquipment.form.manufacturerRequired') }}</small
            >
          </div>

          <div class="form-field">
            <label for="serialNumber">{{ $t('equipment.addEquipment.form.serialNumber') }}</label>
            <InputText
              id="serialNumber"
              v-model="formData.serialNumber"
              :class="{ 'p-invalid': submitted && !formData.serialNumber }"
              :placeholder="$t('equipment.addEquipment.form.serialNumberPlaceholder')"
            />
            <small v-if="submitted && !formData.serialNumber" class="p-error"
              >{{ $t('equipment.addEquipment.form.serialNumberRequired') }}</small
            >
          </div>

          <div class="form-field">
            <label for="code">{{ $t('equipment.addEquipment.form.code') }}</label>
            <InputText
              id="code"
              v-model="formData.code"
              :class="{ 'p-invalid': submitted && !formData.code }"
              :placeholder="$t('equipment.addEquipment.form.codePlaceholder')"
            />
            <small v-if="submitted && !formData.code" class="p-error">{{ $t('equipment.addEquipment.form.codeRequired') }}</small>
          </div>

          <div class="form-field">
            <label for="installationDate">{{ $t('equipment.addEquipment.form.installationDate') }}</label>
            <Calendar
              id="installationDate"
              v-model="formData.installationDate"
              dateFormat="yy-mm-dd"
              :placeholder="$t('equipment.addEquipment.form.installationDatePlaceholder')"
              showIcon
            />
          </div>

          <div class="form-field">
            <label for="powerWatts">{{ $t('equipment.addEquipment.form.powerWatts') }}</label>
            <InputNumber
              id="powerWatts"
              v-model="formData.powerWatts"
              :min="0"
              :placeholder="$t('equipment.addEquipment.form.powerWattsPlaceholder')"
            />
          </div>

          <div class="form-field">
            <label for="locationName">{{ $t('equipment.addEquipment.form.locationName') }}</label>
            <InputText
              id="locationName"
              v-model="formData.locationName"
              :placeholder="$t('equipment.addEquipment.form.locationNamePlaceholder')"
            />
          </div>

          <div class="form-field">
            <label for="locationAddress">{{ $t('equipment.addEquipment.form.locationAddress') }}</label>
            <InputText
              id="locationAddress"
              v-model="formData.locationAddress"
              :placeholder="$t('equipment.addEquipment.form.locationAddressPlaceholder')"
            />
          </div>

          <div class="form-field">
            <label for="image">{{ $t('equipment.addEquipment.form.image') }}</label>
            <InputText id="image" v-model="formData.image" :placeholder="$t('equipment.addEquipment.form.imagePlaceholder')" />
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            :label="$t('equipment.addEquipment.form.add')"
            icon="pi pi-check"
            :loading="loading"
            class="submit-button"
          />
          <Button
            type="button"
            :label="$t('equipment.addEquipment.form.cancel')"
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
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()
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
      summary: t('equipment.addEquipment.toast.success'),
      detail: t('equipment.addEquipment.toast.equipmentAdded'),
      life: 3000,
    })

    setTimeout(() => {
      router.push({ name: 'my-machines' })
    }, 1000)
  } catch (error) {
    console.error('Error adding equipment:', error)
    const msg = error.response?.data?.message || t('equipment.addEquipment.toast.failedToAdd')
    toast.add({
      severity: 'error',
      summary: t('equipment.addEquipment.toast.error'),
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
