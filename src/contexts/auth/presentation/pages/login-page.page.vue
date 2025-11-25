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
      <h2 class="login-heading">Login</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <InputText
          v-model="username"
          placeholder="User"
          class="input-field"
          :class="{ 'p-invalid': errors.username }"
        />
        <small v-if="errors.username" class="p-error">{{ errors.username }}</small>

        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          toggleMask
          class="input-field"
          :class="{ 'p-invalid': errors.password }"
        />
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>

        <div class="form-options">
          <div class="checkbox-wrapper">
            <Checkbox v-model="rememberMe" :binary="true" inputId="remember" />
            <label for="remember" class="checkbox-label">Remember me</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            Forgot your password?
          </a>
        </div>

        <Message v-if="loginError" severity="error" :closable="false">
          {{ loginError }}
        </Message>

        <div class="button-group">
          <Button
            type="submit"
            label="Login"
            class="login-btn"
            :loading="loading"
          />
          <Button
            type="button"
            label="Register"
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
        aria-label="Back to home"
        @click="goToLanding"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineOptions, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
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
const authService = new AuthApiService()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const loginError = ref('')
const errors = ref({})
const userRole = ref('client')

const roleTitle = computed(() => {
  return userRole.value === 'provider' ? 'Providers' : 'Clients'
})

onMounted(() => {
  // Get role from localStorage or route params
  const storedRole = localStorage.getItem('userRole')
  const routeRole = route.params.role

  if (routeRole) {
    userRole.value = routeRole
    localStorage.setItem('userRole', routeRole)
  } else if (storedRole) {
    userRole.value = storedRole
  }
})

const validateForm = () => {
  errors.value = {}

  if (!username.value.trim()) {
    errors.value.username = 'Username is required'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
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

    // For now, use mock authentication
    // TODO: Replace with real API when backend is ready
    if (username.value === 'admin' && password.value === 'admin') {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', '1')
      localStorage.setItem('userEmail', 'juan@ejemplo.com')
      localStorage.setItem('userRole', userRole.value)

      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
      }

      toast.add({
        severity: 'success',
        summary: 'Login Successful',
        detail: `Welcome back!`,
        life: 3000,
      })

      router.push({ name: 'home' })
    } else {
      loginError.value = 'Invalid username or password'
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = 'An error occurred during login. Please try again.'
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
    summary: 'Password Recovery',
    detail: 'Password recovery feature coming soon!',
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
  position: relative;
}

.back-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.app-title {
  color: #0ea5e9;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.role-subtitle {
  color: #1f2937;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.login-heading {
  color: #0ea5e9;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  align-self: flex-start;
  width: 100%;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
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
  width: 100%;
  margin-top: 0.5rem;
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
  user-select: none;
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

.button-group {
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}

.login-btn,
.register-btn {
  flex: 1;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.5rem;
}

@media (max-width: 640px) {
  .login-content {
    padding: 2rem 1.5rem;
    max-width: 90%;
  }

  .logo-section {
    flex-direction: column;
    text-align: center;
  }

  .title-section {
    align-items: center;
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
    gap: 0.75rem;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
