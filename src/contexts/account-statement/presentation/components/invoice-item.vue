<template>
  <div class="row" :class="{ paid: invoice.isPaid(), pending: !invoice.isPaid() }">
    <span class="company">{{ invoice.companyName }}</span>

    <span class="amount">{{ invoice.getFormattedAmount() }}</span>

    <span v-if="invoice.isPaid()" class="status paid">{{ $t('accountStatement.item.paid') }}</span>

    <div v-else class="actions">
      <span class="status pending">{{ $t('accountStatement.item.pending') }}</span>
      <button class="btn-pay" @click="pay" :disabled="loading">
        {{ $t('accountStatement.item.pay') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AccountStatementApiService } from '../../infrastructure/account-statement.api-service.js'

// Ya NO necesitamos importar funciones sueltas de invoice.entity.js
// porque ahora los métodos viven dentro del objeto 'invoice'

const props = defineProps({ invoice: { type: Object, required: true } })
const emit = defineEmits(['changed'])

const api = new AccountStatementApiService()
const loading = ref(false)

async function pay() {
  try {
    loading.value = true
    await api.markAsPaid(props.invoice.id)
    emit('changed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid #eef0f3;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.06);
}
.company {
  font-weight: 700;
  color: #2b2f33;
}
.amount {
  font-weight: 600;
  color: #1b1f24;
}
.status {
  font-weight: 700;
}
.status.paid {
  color: #20a35b;
}
.status.pending {
  color: #e53935;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-pay {
  background: #1abc50;
  border: none;
  color: #fff;
  font-weight: 800;
  padding: 0.45rem 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(26, 188, 80, 0.25);
}
.btn-pay:hover {
  filter: brightness(0.95);
}
.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
