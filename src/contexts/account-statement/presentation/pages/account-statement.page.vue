<template>
  <section class="wrap">
    <h1 class="title">{{ $t('accountStatement.title') }}</h1>

    <div class="list" v-if="invoices.length">
      <invoice-item v-for="inv in invoices" :key="inv.id" :invoice="inv" @changed="load" />
    </div>

    <p v-else class="hint">Here you can view your pending and paid receipts.</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import InvoiceItem from '../components/invoice-item.vue'
import { AccountStatementApiService } from '../../infrastructure/account-statement.api-service.js'

const api = new AccountStatementApiService()
const invoices = ref([])
const userId = 1

async function load() {
  invoices.value = await api.getInvoicesByUser(userId)
}

onMounted(load)
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  background: #f4f7fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1rem;
}
.title {
  color: #1976d2;
  font-weight: 800;
  font-size: 2.4rem;
  margin-bottom: 1.2rem;
}
.list {
  width: min(680px, 92%);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.hint {
  margin-top: 1.8rem;
  color: #636a73;
  font-size: 0.98rem;
  text-align: center;
}
</style>
