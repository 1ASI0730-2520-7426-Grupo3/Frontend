<template>
  <div class="register-container">
    <div class="register-content">
      <!-- Left: Form Section -->
      <div class="form-section">
        <h1 class="register-heading">Sign Up</h1>

        <form @submit.prevent="handleRegister" class="register-form">
          <InputText
            v-model="formData.fullName"
            placeholder="Full Name"
            class="input-field"
            :class="{ 'p-invalid': errors.fullName }"
          />
          <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>

          <InputText
            v-model="formData.username"
            placeholder="User"
            class="input-field"
            :class="{ 'p-invalid': errors.username }"
          />
          <small v-if="errors.username" class="p-error">{{ errors.username }}</small>

          <InputText
            v-model="formData.email"
            type="email"
            placeholder="Email"
            class="input-field"
            :class="{ 'p-invalid': errors.email }"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>

          <Password
            v-model="formData.password"
            placeholder="Password"
            :feedback="true"
            toggleMask
            class="input-field"
            :class="{ 'p-invalid': errors.password }"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>

          <Password
            v-model="formData.confirmPassword"
            placeholder="Confirm your password"
            :feedback="false"
            toggleMask
            class="input-field"
            :class="{ 'p-invalid': errors.confirmPassword }"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>

          <Message v-if="registerError" severity="error" :closable="false">
            {{ registerError }}
          </Message>

          <Button
            type="submit"
            label="Create account"
            class="create-account-btn"
            :loading="loading"
          />
        </form>
      </div>

      <!-- Right: Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <h1 class="app-title">CoolGym</h1>
          <p class="role-subtitle">{{ roleTitle }}</p>
          <img src="@/assets/CoolGymImage.png" alt="CoolGym logo" class="register-logo" />
        </div>
      </div>

      <!-- Back to Login -->
      <Button
        icon="pi pi-arrow-left"
        rounded
        text
        class="back-button"
        aria-label="Back to login"
        @click="goToLogin"
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
import Message from 'primevue/message'

defineOptions({
  name: 'RegisterPage',
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const formData = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const registerError = ref('')
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

  if (!formData.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required'
  }

  if (!formData.value.username.trim()) {
    errors.value.username = 'Username is required'
  } else if (formData.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (!formData.value.password) {
    errors.value.password = 'Password is required'
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  registerError.value = ''

  if (!validateForm()) {
    return
  }

  try {
    loading.value = true

    // TODO: Replace with real API call
    // For now, simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Registration Successful',
      detail: 'Your account has been created. You can now log in.',
      life: 3000,
    })

    // Redirect to login
    router.push({ name: 'login', params: { role: userRole.value } })
  } catch (error) {
    console.error('Registration error:', error)
    registerError.value = 'An error occurred during registration. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'login', params: { role: userRole.value } })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  padding: 2rem;
}

.register-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  padding: 3rem;
  position: relative;
}

.back-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-heading {
  color: #0ea5e9;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.register-form {
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

.create-account-btn {
  margin-top: 1rem;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bae6fd 100%);
  border-radius: 12px;
  padding: 2rem;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.app-title {
  color: #0ea5e9;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.role-subtitle {
  color: #1f2937;
  font-size: 1rem;
  margin: 0;
  font-weight: 600;
}

.register-logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-content {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    gap: 2rem;
  }

  .logo-section {
    order: -1;
  }

  .register-heading {
    font-size: 1.75rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .register-logo {
    width: 120px;
    height: 120px;
  }
}
</style>
