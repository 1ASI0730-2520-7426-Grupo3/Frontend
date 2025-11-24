<template>
  <div class="maintenance-card">
    <div class="maintenance-card__image-section">
      <img
        :src="equipmentImage"
        :alt="equipmentName"
        class="maintenance-card__image"
      />
      <div class="maintenance-card__title">{{ equipmentName }}</div>
    </div>

    <div class="maintenance-card__info">
      <div class="maintenance-card__client">
        <span class="maintenance-card__label">Client:</span>
        <span class="maintenance-card__client-name">{{ clientName }}</span>
      </div>

      <div class="maintenance-card__actions">
        <span
          class="maintenance-card__status"
          :class="`maintenance-card__status--${status.toLowerCase()}`"
        >
          {{ status }}
        </span>
        <pv-button
          label="Submit"
          class="maintenance-card__submit-btn"
          @click="$emit('submit', requestId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  requestId: {
    type: Number,
    required: true
  },
  equipmentName: {
    type: String,
    required: true
  },
  equipmentImage: {
    type: String,
    default: 'https://placehold.co/400x300/4169e1/ffffff?text=Equipment'
  },
  clientName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  }
})

defineEmits(['submit'])
</script>

<style scoped>
.maintenance-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: box-shadow 0.3s ease;
}

.maintenance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.maintenance-card__image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.maintenance-card__image {
  width: 100%;
  max-width: 120px;
  height: auto;
  object-fit: contain;
}

.maintenance-card__title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  text-align: center;
}

.maintenance-card__info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.maintenance-card__client {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.maintenance-card__label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.maintenance-card__client-name {
  font-size: 0.95rem;
  color: #1f2937;
  font-weight: 600;
}

.maintenance-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.maintenance-card__status {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.maintenance-card__status--pending {
  background-color: #fef2f2;
  color: #ef4444;
}

.maintenance-card__status--completed {
  background-color: #f0fdf4;
  color: #22c55e;
}

.maintenance-card__status--in-progress {
  background-color: #fef3c7;
  color: #f59e0b;
}

.maintenance-card__submit-btn {
  background-color: #22c55e;
  border-color: #22c55e;
  color: white;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.maintenance-card__submit-btn:hover {
  background-color: #16a34a;
  border-color: #16a34a;
}

@media (max-width: 768px) {
  .maintenance-card {
    padding: 16px;
  }

  .maintenance-card__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .maintenance-card__submit-btn {
    width: 100%;
  }
}
</style>
