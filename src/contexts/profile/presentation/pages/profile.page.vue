<template>
  <div class="profile-page">
    <!-- Back Button -->
    <Button
      icon="pi pi-arrow-left"
      rounded
      text
      :aria-label="t('profile.back')"
      @click="goBack"
      class="back-button"
    />

    <h1 class="page-title">{{ t('profile.title') }}</h1>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-else-if="userProfile" class="profile-content">
      <div class="user-info">
        <div class="avatar-section">
          <Avatar
            v-if="!userProfile.profilePhoto"
            :label="getInitials(userProfile.name)"
            size="xlarge"
            shape="circle"
            class="user-avatar"
          />
          <img
            v-else
            :src="userProfile.profilePhoto"
            :alt="userProfile.name"
            class="user-avatar-image"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
          <Button
            icon="pi pi-camera"
            rounded
            class="upload-photo-btn"
            @click="triggerFileInput"
            :aria-label="t('profile.uploadPhoto')"
          />
        </div>
        <h2 class="user-name">{{ userProfile.name }}</h2>
        <p class="user-email">{{ userProfile.email }}</p>
        <p class="user-username">{{ userProfile.username }}</p>
      </div>

      <div class="current-plan-type">
        <p>
          {{ t('profile.currentPlanType') }}: <strong>{{ userProfile.currentPlan?.name || t('profile.noPlan') }}</strong>
        </p>
      </div>

      <div class="plans-section">
        <h2 class="plans-title">{{ t('profile.availablePlans') }}</h2>
        <div class="plans-grid">
          <div
            v-for="plan in filteredPlans"
            :key="plan.id"
            class="plan-card"
            :class="{ 'current-plan': userProfile.clientPlanId === plan.id }"
          >
            <h3 class="plan-name">{{ t(`profile.plans.${plan.id}.name`) }}</h3>
            <p class="plan-machines">
              {{
                plan.maxMachines >= 999
                  ? t('profile.plans.unlimitedClients')
                  : plan.id <= 3
                    ? t('profile.plans.upToMachines', { count: plan.maxMachines })
                    : t('profile.plans.upToClients', { count: plan.maxMachines })
              }}
            </p>
            <p class="plan-price">${{ plan.price.toFixed(2) }} USD / {{ t('profile.plans.monthly') }}</p>
            <Button
              :label="userProfile.clientPlanId === plan.id ? t('profile.currentPlan') : t('profile.selectPlan')"
              :disabled="userProfile.clientPlanId === plan.id"
              @click="handleSelectPlan(plan.id)"
              class="select-plan-btn"
              :class="{ 'current-plan-btn': userProfile.clientPlanId === plan.id }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { ProfileApiService } from '../../infrastructure/profile-api.service.js'
import { AuthApiService } from '@/contexts/auth/infrastructure/auth-api.service.js'

defineOptions({
  name: 'ProfilePage',
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const profileService = new ProfileApiService()
const authService = new AuthApiService()

const userProfile = ref(null)
const plans = ref([])
const loading = ref(true)
const error = ref(null)
const fileInput = ref(null)

/**
 * Filter plans based on user role
 * Clients: Basic, Standard, Premium (IDs 1, 2, 3)
 * Providers: Small Company, Medium Company, Enterprise Premium (IDs 4, 5, 6)
 */
const filteredPlans = computed(() => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase()

  if (userRole === 'client') {
    // Show only Basic, Standard, Premium (IDs 1-3)
    return plans.value.filter(plan => plan.id >= 1 && plan.id <= 3)
  } else if (userRole === 'provider') {
    // Show only Small Company, Medium Company, Enterprise Premium (IDs 4-6)
    return plans.value.filter(plan => plan.id >= 4 && plan.id <= 6)
  }

  return plans.value
})

/**
 * Get user initials for avatar
 */
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

/**
 * Go back to previous page
 */
const goBack = () => {
  router.back()
}

/**
 * Trigger file input click
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * Handle file selection
 */
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: t('profile.toast.invalidFile'),
      detail: t('profile.toast.pleaseSelectImage'),
      life: 3000,
    })
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.add({
      severity: 'error',
      summary: t('profile.toast.fileTooLarge'),
      detail: t('profile.toast.imageMustBeLessThan5MB'),
      life: 3000,
    })
    return
  }

  try {
    loading.value = true

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target?.result

      const userId = authService.getCurrentUserId()
      await profileService.updateProfilePhoto(userId, base64Image)

      userProfile.value.profilePhoto = base64Image

      toast.add({
        severity: 'success',
        summary: t('profile.toast.photoUpdated'),
        detail: t('profile.toast.photoUploadSuccess'),
        life: 3000,
      })

      loading.value = false
    }

    reader.onerror = () => {
      toast.add({
        severity: 'error',
        summary: t('profile.toast.uploadFailed'),
        detail: t('profile.toast.failedToReadImage'),
        life: 3000,
      })
      loading.value = false
    }

    reader.readAsDataURL(file)
  } catch (err) {
    const errorMessage = err.response?.data?.message || t('profile.toast.failedToUploadPhoto')
    toast.add({
      severity: 'error',
      summary: t('profile.toast.uploadFailed'),
      detail: errorMessage,
      life: 3000,
    })
    loading.value = false
  }
}

/**
 * Handle plan selection
 */
const handleSelectPlan = async (planId) => {
  try {
    loading.value = true
    const userId = authService.getCurrentUserId()

    userProfile.value = await profileService.updateUserPlan(userId, planId)

    toast.add({
      severity: 'success',
      summary: t('profile.toast.planUpdated'),
      detail: t('profile.toast.planUpdateSuccess'),
      life: 3000,
    })
  } catch (err) {
    const errorMessage = err.response?.data?.message || t('profile.toast.failedToUpdatePlan')
    toast.add({
      severity: 'error',
      summary: t('profile.toast.updateFailed'),
      detail: errorMessage,
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

/**
 * Load profile data
 */
const loadProfileData = async () => {
  try {
    loading.value = true
    error.value = null

    const userId = authService.getCurrentUserId()

    if (!userId) {
      error.value = t('profile.userNotAuthenticated')
      return
    }

    const [profile, allPlans] = await Promise.all([
      profileService.getUserProfile(userId),
      profileService.getAllPlans(),
    ])

    userProfile.value = profile
    plans.value = allPlans
  } catch (err) {
    error.value =
      err.response?.data?.message || `${t('profile.toast.failedToLoadProfile')}: ${err.message}`
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.page-title {
  text-align: center;
  color: #0288d1;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.avatar-section {
  position: relative;
  display: inline-block;
}

.user-avatar {
  background: #0288d1;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  width: 120px;
  height: 120px;
}

.user-avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0288d1;
}

.upload-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #0288d1;
  color: white;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.upload-photo-btn:hover {
  background: #0277bd;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.user-email {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
  text-decoration: underline;
}

.user-username {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.current-plan-type {
  text-align: center;
  font-size: 1.125rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
}

.current-plan-type strong {
  color: #0288d1;
}

.plans-section {
  padding: 2rem 0;
}

.plans-title {
  text-align: center;
  color: #0288d1;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.plan-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.plan-card.current-plan {
  border-color: #0288d1;
  background: #e3f2fd;
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.2);
}

.plan-name {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.plan-card.current-plan .plan-name {
  color: #0288d1;
}

.plan-machines {
  color: #666;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.plan-price {
  color: #0288d1;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1rem 0 0 0;
}

.select-plan-btn {
  margin-top: 1rem;
  width: 100%;
  background: #0288d1;
  border-color: #0288d1;
  color: white;
}

.select-plan-btn:hover:not(:disabled) {
  background: #0277bd;
  border-color: #0277bd;
}

.select-plan-btn.current-plan-btn {
  background: #e3f2fd;
  border-color: #0288d1;
  color: #0288d1;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
