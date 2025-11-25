<template>
  <div class="plan-card">
    <h3 class="plan-name">{{ plan.name }}</h3>
    <p class="plan-machines">{{ plan.getMaxMachinesText() }}</p>
    <p class="plan-price">{{ plan.getFormattedPrice('USD') }}</p>
    <Button
      :label="isCurrentPlan ? 'Current' : 'Update'"
      :disabled="isCurrentPlan"
      :outlined="!isCurrentPlan"
      @click="handleUpdate"
      class="plan-button"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

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
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  min-width: 200px;
  gap: 0.75rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.plan-machines {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.plan-price {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
}

.plan-button {
  margin-top: 0.5rem;
  width: 100%;
}
</style>
