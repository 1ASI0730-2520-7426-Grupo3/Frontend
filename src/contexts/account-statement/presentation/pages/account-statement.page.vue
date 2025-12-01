<template>
  <section class="wrap">
    <h1 class="title">{{ $t('accountStatement.title') }}</h1>

    <div v-if="loading" class="loading-state">
      <p>Cargando estado de cuenta...</p>
    </div>

    <div v-else-if="error" class="error-box">
      <p>Error: {{ error }}</p>
    </div>

    <div class="list" v-else-if="invoices.length">
      <invoice-item v-for="inv in invoices" :key="inv.id" :invoice="inv" @changed="load" />
    </div>

    <p v-else class="hint">No se encontraron facturas pendientes o pagadas.</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import InvoiceItem from '../components/invoice-item.vue'
import { AccountStatementApiService } from '../../infrastructure/account-statement.api-service.js'

const api = new AccountStatementApiService()
const invoices = ref([])
const loading = ref(false)
const error = ref(null)

const userId = localStorage.getItem('userId')

async function load() {
  if (!userId) {
    error.value = 'Usuario no autenticado.'
    return
  }

  loading.value = true
  error.value = null

  try {
    invoices.value = await api.getInvoicesByUser(userId)
  } catch (err) {
    console.error('Error cargando facturas:', err)
    error.value = 'No se pudieron cargar las facturas.'
  } finally {
    loading.value = false
  }
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
.hint,
.loading-state {
  margin-top: 1.8rem;
  color: #636a73;
  font-size: 0.98rem;
  text-align: center;
}
.error-box {
  color: #d32f2f;
  background: #ffebee;
  padding: 1rem;
  border-radius: 8px;
}
</style>
