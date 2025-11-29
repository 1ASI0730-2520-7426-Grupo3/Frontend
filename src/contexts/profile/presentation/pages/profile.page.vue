<template>
  <div class="profile-page">
    <!-- Back Button -->
    <Button
      icon="pi pi-arrow-left"
      rounded
      text
      aria-label="Back"
      @click="goBack"
      class="back-button"
    />

    <!-- Page Title -->
    <h1 class="page-title">My CoolGym Account</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <!-- Profile Content -->
    <div v-else-if="userProfile" class="profile-content">
      <!-- User Info Section -->
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
            aria-label="Upload profile photo"
          />
        </div>
        <h2 class="user-name">{{ userProfile.name }}</h2>
        <p class="user-email">{{ userProfile.email }}</p>
        <p class="user-username">{{ userProfile.username }}</p>
      </div>

      <!-- Current Plan Type -->
      <div class="current-plan-type">
        <p>
          Current Plan type: <strong>{{ userProfile.getCurrentPlanType() }}</strong>
        </p>
      </div>

      <!-- Plans Section -->
      <div class="plans-section">
        <div class="plans-grid">
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :current-plan-id="userProfile.clientPlanId"
            @update-plan="handleUpdatePlan"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PlanCard from '../components/plan-card.component.vue'
import { ProfileApiService } from '../../infrastructure/profile-api.service.js'
import { AuthApiService } from '@/contexts/auth/infrastructure/auth-api.service.js'

defineOptions({
  name: 'ProfilePage',
})

const router = useRouter()
const toast = useToast()
const profileService = new ProfileApiService()
const authService = new AuthApiService()

const userProfile = ref(null)
const plans = ref([])
const loading = ref(true)
const error = ref(null)
const fileInput = ref(null)

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
      summary: 'Invalid File',
      detail: 'Please select an image file',
      life: 3000,
    })
    return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: 'Image must be less than 5MB',
      life: 3000,
    })
    return
  }

  try {
    loading.value = true

    // Convert file to base64 for display and storage
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target?.result

      // Update profile photo via API
      const userId = authService.getCurrentUserId()
      await profileService.updateProfilePhoto(userId, base64Image)

      // Update local state
      userProfile.value.profilePhoto = base64Image

      toast.add({
        severity: 'success',
        summary: 'Photo Updated',
        detail: 'Your profile photo has been updated successfully',
        life: 3000,
      })

      loading.value = false
    }

    reader.onerror = () => {
      toast.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Failed to read the image file',
        life: 3000,
      })
      loading.value = false
    }

    reader.readAsDataURL(file)
  } catch (err) {
    console.error('Error uploading photo:', err)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload photo. Please try again.',
      life: 3000,
    })
    loading.value = false
  }
}

/**
 * Handle plan update
 */
const handleUpdatePlan = async (planId) => {
  try {
    loading.value = true
    const userId = authService.getCurrentUserId()

    userProfile.value = await profileService.updateUserPlan(userId, planId)

    toast.add({
      severity: 'success',
      summary: 'Plan Updated',
      detail: 'Your subscription plan has been updated successfully',
      life: 3000,
    })
  } catch (err) {
    console.error('Error updating plan:', err)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to update your plan. Please try again.',
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

    console.log('Loading profile data...')
    const userId = authService.getCurrentUserId()
    console.log('User ID from localStorage:', userId)

    if (!userId) {
      error.value = 'User not authenticated'
      console.error('No user ID found in localStorage')
      return
    }

    // Load user profile and plans in parallel
    console.log('Fetching user profile and plans...')
    const [profile, allPlans] = await Promise.all([
      profileService.getUserProfile(userId),
      profileService.getAllPlans(),
    ])

    console.log('User profile loaded:', profile)
    console.log('Plans loaded:', allPlans)

    userProfile.value = profile
    plans.value = allPlans
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = `Failed to load profile data: ${err.message}`
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
  padding: 1rem 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
