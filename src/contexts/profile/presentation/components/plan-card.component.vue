<template>
  <div class="plan-card">
    <h3 class="plan-name">{{ plan.name }}</h3>
    <p class="plan-machines">{{ plan.getMaxMachinesText() }}</p>
    <p class="plan-price">{{ plan.getFormattedPrice('USD') }}</p>
    <Button
      :label="isCurrentPlan ? t('profile.planCard.current') : t('profile.planCard.update')"
      :disabled="isCurrentPlan"
      :severity="isCurrentPlan ? 'primary' : 'primary'"
      @click="handleUpdate"
      class="plan-button"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const { t } = useI18n()

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
  currentPlanId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update-plan'])

const isCurrentPlan = computed(() => {
  return props.currentPlanId === props.plan.id
})

const handleUpdate = () => {
  if (!isCurrentPlan.value) {
    emit('update-plan', props.plan.id)
  }
}
</script>

<style scoped>
.plan-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  min-width: 250px;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.plan-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0ea5e9;
  margin: 0;
  text-align: center;
}

.plan-machines {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  text-align: center;
}

.plan-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0.5rem 0;
  text-align: center;
}

.plan-button {
  margin-top: 0.75rem;
  width: 100%;
  font-weight: 600;
}
</style>
