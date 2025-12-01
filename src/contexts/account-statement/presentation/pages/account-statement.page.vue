<template>
  <section class="wrap">
    <h1 class="title">{{ t('accountStatement.title') }}</h1>

    <div v-if="loading" class="loading-state">
      <p>{{ t('accountStatement.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-box">
      <p>{{ t('common.error') }}: {{ error }}</p>
    </div>

    <div class="list" v-else-if="invoices.length">
      <invoice-item v-for="inv in invoices" :key="inv.id" :invoice="inv" @changed="load" />
    </div>

    <p v-else class="hint">{{ t('accountStatement.noInvoices') }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InvoiceItem from '../components/invoice-item.vue'
import { AccountStatementApiService } from '../../infrastructure/account-statement.api-service.js'

const { t } = useI18n()
const api = new AccountStatementApiService()
const invoices = ref([])
const loading = ref(false)
const error = ref(null)

const userId = localStorage.getItem('userId')

async function load() {
  if (!userId) {
    error.value = t('accountStatement.userNotAuthenticated')
    return
  }

  loading.value = true
  error.value = null

  try {
    invoices.value = await api.getInvoicesByUser(userId)
  } catch (err) {
    console.error('Error loading invoices:', err)

    // If backend returns a localized error message, use it
    error.value = err.response?.data?.message || t('accountStatement.errorLoadingInvoices')
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
