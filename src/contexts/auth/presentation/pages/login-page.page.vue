<template>
  <div class="login-container">
    <div class="login-content">
      <!-- Logo and Title -->
      <div class="logo-section">
        <img src="@/assets/CoolGymImage.png" alt="CoolGym logo" class="login-logo" />
        <div class="title-section">
          <h1 class="app-title">CoolGym</h1>
          <p class="role-subtitle">{{ roleTitle }}</p>
        </div>
      </div>

      <!-- Login Form -->
      <h2 class="login-heading">{{ $t('auth.login.title') }}</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <InputText
          v-model="email"
          type="email"
          :placeholder="$t('auth.login.email')"
          class="input-field"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>

        <Password
          v-model="password"
          :placeholder="$t('auth.login.password')"
          :feedback="false"
          toggleMask
          class="input-field"
          :class="{ 'p-invalid': errors.password }"
        />
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>

        <div class="form-options">
          <div class="checkbox-wrapper">
            <Checkbox v-model="rememberMe" :binary="true" inputId="remember" />
            <label for="remember" class="checkbox-label">{{ $t('auth.login.rememberMe') }}</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            {{ $t('auth.login.forgotPassword') }}
          </a>
        </div>

        <Message v-if="loginError" severity="error" :closable="false">
          {{ loginError }}
        </Message>

        <div class="button-group">
          <Button type="submit" :label="$t('auth.login.loginButton')" class="login-btn" :loading="loading" />
          <Button
            type="button"
            :label="$t('auth.login.registerButton')"
            outlined
            class="register-btn"
            @click="goToRegister"
          />
        </div>
      </form>

      <!-- Back to Landing -->
      <Button
        icon="pi pi-arrow-left"
        rounded
        text
        class="back-button"
        :aria-label="$t('auth.login.backToHome')"
        @click="goToLanding"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineOptions, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import { AuthApiService } from '../../infrastructure/auth-api.service.js'

defineOptions({
  name: 'LoginPage',
})

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const authService = new AuthApiService()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const loginError = ref('')
const errors = ref({})
const userRole = ref('client')

const roleTitle = computed(() => {
  return userRole.value === 'provider' ? t('auth.register.roleProviders') : t('auth.register.roleClients')
})

onMounted(() => {
  const storedRole = localStorage.getItem('userRole')
  const routeRole = route.params.role

  console.log('Login Page - Route role:', routeRole, 'Stored role:', storedRole)
  console.log('Login Page - Current route path:', route.path)

  if (routeRole) {
    userRole.value = routeRole
    localStorage.setItem('userRole', routeRole)
  } else if (storedRole) {
    userRole.value = storedRole
  }

  console.log('Login Page - Final userRole:', userRole.value)
})

const validateForm = () => {
  errors.value = {}

  if (!email.value.trim()) {
    errors.value.email = t('auth.login.validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('auth.login.validation.emailInvalid')
  }

  if (!password.value) {
    errors.value.password = t('auth.login.validation.passwordRequired')
  }

  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  loginError.value = ''

  if (!validateForm()) {
    return
  }

  try {
    loading.value = true

    // Login and get user data from backend
    await authService.login(email.value, password.value)

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true')
    }

    toast.add({
      severity: 'success',
      summary: t('auth.login.toast.success'),
      detail: t('auth.login.toast.welcomeBack'),
      life: 3000,
    })

    // IMPORTANT: Get role from localStorage AFTER login
    // (authService.login sets it from backend response)
    const role = localStorage.getItem('userRole')
    console.log('User logged in with role:', role)

    // Redirect based on the BACKEND-provided role
    if (role === 'provider') {
      router.push({ name: 'provider-home' })
    } else {
      router.push({ name: 'client-home' })
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = error.message || t('auth.login.toast.invalidCredentials')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push({ name: 'register', params: { role: userRole.value } })
}

const handleForgotPassword = () => {
  toast.add({
    severity: 'info',
    summary: t('auth.login.toast.passwordRecovery'),
    detail: t('auth.login.toast.passwordRecoveryComingSoon'),
    life: 3000,
  })
}

const goToLanding = () => {
  router.push({ name: 'landing' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  position: relative;
}

.login-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.login-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.title-section {
  text-align: center;
}

.app-title {
  color: #0ea5e9;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.role-subtitle {
  color: #1f2937;
  font-size: 1rem;
  margin: 0.25rem 0 0 0;
  font-weight: 600;
}

.login-heading {
  color: #0ea5e9;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  width: 100%;
}

.input-field:deep(.p-inputtext),
.input-field:deep(.p-password-input) {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
}

.forgot-password {
  color: #0ea5e9;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #0284c7;
  text-decoration: underline;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.5rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.login-btn,
.register-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
}

.back-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

@media (max-width: 640px) {
  .login-content {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .login-logo {
    width: 80px;
    height: 80px;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .login-heading {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
