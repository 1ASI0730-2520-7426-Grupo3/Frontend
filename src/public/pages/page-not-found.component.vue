<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const unavailableRoute = ref(null)

onMounted(() => {
  unavailableRoute.value = route.path
})
</script>

<template>
  <div class="w-full">
    <h1>{{ t('pageNotFound.title') }}</h1>
    <p>{{ t('pageNotFound.message', { path: unavailableRoute }) }}</p>
    <router-link to="/home">{{ t('pageNotFound.goHome') }}</router-link>
  </div>
</template>

<style scoped></style>
