
<template>
  <div class="login-container">
    <div class="login-content">
      <img src="@/assets/CoolGymImage.png" alt="CoolGym logo - Exercise bike" class="login-logo" />
      <h1 class="login-title">CoolGym</h1>
      <p class="login-subtitle">Intelligent management of fitness equipment</p>
      <button class="login-button" @click="handleLogin">Login</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  // For simple login, use default user (Juan Pérez - id: 1)
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('userId', '1')
  localStorage.setItem('userEmail', 'juan@ejemplo.com')
  router.push({ name: 'home' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.login-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.login-title {
  color: #2563eb;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.login-subtitle {
  color: #4b5563;
  font-size: 1rem;
  text-align: center;
  margin: 0;
}

.login-button {
  background-color: #0ea5e9;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.login-button:hover {
  background-color: #0284c7;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .login-content {
    padding: 2rem 1.5rem;
  }

  .login-logo {
    width: 100px;
    height: 100px;
  }

  .login-title {
    font-size: 2rem;
  }

  .login-subtitle {
    font-size: 0.9rem;
  }

  .login-button {
    padding: 0.875rem 2.5rem;
    font-size: 1.125rem;
  }
}
</style>
