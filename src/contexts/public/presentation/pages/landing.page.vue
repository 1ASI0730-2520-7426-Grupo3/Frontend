<template>
  <div class="landing-container">
    <div class="landing-content">
      <h1 class="landing-title">{{ t('landing.title') }}</h1>
      <div class="role-selection">
        <Button
          :label="t('landing.forGyms')"
          class="role-button gyms-button"
          @click="selectRole('client')"
        />
        <Button
          :label="t('landing.forProviders')"
          class="role-button providers-button"
          @click="selectRole('provider')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

defineOptions({
  name: 'LandingPage',
})

const router = useRouter()
const { t } = useI18n()

const selectRole = (role) => {
  localStorage.setItem('userRole', role)

  router.push({ name: 'login', params: { role } })
}
</script>

<style scoped>
.landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
}

.landing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 400px;
}

.landing-title {
  color: #0ea5e9;
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.role-button {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.gyms-button {
  background-color: #0ea5e9;
  border-color: #0ea5e9;
}

.gyms-button:hover {
  background-color: #0284c7;
  border-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.providers-button {
  background-color: #0ea5e9;
  border-color: #0ea5e9;
}

.providers-button:hover {
  background-color: #0284c7;
  border-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

@media (max-width: 640px) {
  .landing-content {
    min-width: auto;
    width: 90%;
    padding: 2rem 1.5rem;
  }

  .landing-title {
    font-size: 2.5rem;
  }

  .role-button {
    font-size: 1rem;
  }
}
</style>
