<!--
  Summary: Main navigation toolbar component for CoolGym application
  Provides branding, navigation menu, notifications, user profile, and language selection
-->
<template>
  <div class="toolbar-wrapper">
    <pv-toolbar class="coolgym-toolbar">
      <template #start>
        <div class="brand-section">
          <img
            src="@/assets/CoolGymImage.png"
            alt="CoolGym logo - Exercise bike"
            class="brand-logo"
          />
          <div class="brand-content">
            <h1 class="brand-title">{{ $t('toolbar.brand.title') }}</h1>
            <span class="brand-description">{{ $t('toolbar.brand.description') }}</span>
          </div>
        </div>
      </template>

      <template #center>
        <!-- Only show navigation when authenticated -->
        <nav
          v-if="isAuthenticated"
          class="navigation-section"
          role="navigation"
          aria-label="Main navigation"
        >
          <button
            class="menu-toggle"
            @click="toggleMenu"
            aria-label="Toggle navigation menu"
            :aria-expanded="isMenuOpen"
          >
            <i :class="isMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
          </button>
          <div class="nav-links-desktop">
            <a
              v-for="link in navigationLinks"
              :key="link.name"
              href="#"
              @click.prevent="handleNavigation(link.route)"
              :class="['nav-link', { active: activeRoute === link.route }]"
              :aria-label="link.label"
            >
              {{ link.label }}
            </a>
          </div>
        </nav>
      </template>

      <template #end>
        <div class="actions-section">
          <!-- Action buttons only visible when authenticated -->
          <template v-if="isAuthenticated">
            <button
              class="icon-button"
              :aria-label="$t('toolbar.actions.notifications')"
              @click="handleNotifications"
            >
              <i class="pi pi-bell"></i>
            </button>
            <button
              class="icon-button"
              :aria-label="$t('toolbar.actions.profile')"
              @click="handleProfile"
            >
              <i class="pi pi-user"></i>
            </button>
            <button
              class="icon-button logout-button"
              :aria-label="$t('toolbar.actions.logout')"
              @click="handleLogout"
              :title="$t('toolbar.actions.logout')"
            >
              <i class="pi pi-sign-out"></i>
            </button>
          </template>

          <!-- Language selector always visible -->
          <div class="language-selector">
            <span
              class="language-option"
              :class="{ active: currentLanguage === 'en' }"
              @click="setLanguage('en')"
              role="button"
              aria-label="Switch to English"
            >
              EN
            </span>
            <span class="language-separator">|</span>
            <span
              class="language-option"
              :class="{ active: currentLanguage === 'es' }"
              @click="setLanguage('es')"
              role="button"
              aria-label="Switch to Spanish"
            >
              ES
            </span>
          </div>
        </div>
      </template>
    </pv-toolbar>

    <!-- Mobile menu only visible when authenticated -->
    <div v-if="isAuthenticated && isMenuOpen" class="mobile-menu">
      <a
        v-for="link in navigationLinks"
        :key="link.name"
        href="#"
        @click.prevent="handleNavigation(link.route)"
        :class="['mobile-nav-link', { active: activeRoute === link.route }]"
      >
        {{ link.label }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const currentLanguage = ref(locale.value)
const isMenuOpen = ref(false)

const router = useRouter()
const route = useRoute()

const activeRoute = computed(() => route.name)
const userRole = ref(localStorage.getItem('userRole') || 'client')

// Check authentication status
const isAuthenticated = computed(() => localStorage.getItem('isAuthenticated') === 'true')

const navigationLinks = computed(() => {
  const isClient = userRole.value === 'client'
  const isProvider = userRole.value === 'provider'

  const links = [
    { name: 'home', route: 'home', label: t('toolbar.nav.home'), roles: ['client', 'provider'] },
  ]

  if (isClient) {
    links.push(
      {
        name: 'my-machines',
        route: 'my-machines',
        label: t('toolbar.nav.myMachines'),
        roles: ['client'],
      },
      {
        name: 'maintenance',
        route: 'maintenance',
        label: t('toolbar.nav.maintenance'),
        roles: ['client'],
      },
      {
        name: 'account-statement',
        route: 'account-statement',
        label: t('toolbar.nav.billing'),
        roles: ['client'],
      },
    )
  }

  if (isProvider) {
    links.push(
      { name: 'my-teams', route: 'my-teams', label: t('toolbar.nav.myTeams'), roles: ['provider'] },
      {
        name: 'provider-requests',
        route: 'provider-requests',
        label: t('toolbar.nav.requests'),
        roles: ['provider'],
      },
    )
  }

  if (isClient) {
    links.push({ name: 'rent', route: 'rent', label: t('toolbar.nav.rent'), roles: ['client'] })
  }

  links.push({
    name: 'contact',
    route: 'contact',
    label: t('toolbar.nav.contact'),
    roles: ['client', 'provider'],
  })

  return links
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleNavigation = (routeName) => {
  router.push({ name: routeName })
  isMenuOpen.value = false
}

const handleNotifications = () => {
  router.push({ name: 'notifications' })
}

const handleProfile = () => {
  router.push({ name: 'profile' })
}

const handleLogout = () => {
  // Clear all authentication data
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userId')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userRole')

  // Redirect to login page
  router.push({ name: 'login' })
}

const setLanguage = (lang) => {
  currentLanguage.value = lang
  locale.value = lang
  console.log(`Language changed to: ${lang}`)
}
</script>

<style scoped>
.toolbar-wrapper {
  position: relative;
}

.coolgym-toolbar {
  background: white;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 0px 0px 0 0;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.brand-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  color: #2563eb;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  color: #2563eb;
  font-size: 1rem;
  line-height: 1;
}

.brand-description {
  color: #2563eb;
  font-size: 0.75rem;
  line-height: 1;
}

.navigation-section {
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #1f2937;
  font-size: 1.5rem;
}

.menu-toggle:hover {
  color: #2563eb;
}

.nav-links-desktop {
  display: flex;
  align-items: center;
  gap: 32px;
}

.mobile-menu {
  display: none;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #2563eb;
}

.nav-link.active {
  color: #2563eb;
  font-weight: 600;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-button i {
  font-size: 1.5rem;
  color: #1f2937;
}

.icon-button:hover i {
  color: #2563eb;
}

.logout-button:hover i {
  color: #ef4444;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.language-option {
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.language-option:hover {
  color: #2563eb;
}

.language-option.active {
  color: #1f2937;
  font-weight: 700;
}

.language-separator {
  color: #9ca3af;
  font-size: 0.875rem;
}

@media (max-width: 1200px) {
  .navigation-section {
    gap: 24px;
  }

  .brand-description {
    font-size: 0.7rem;
  }
}

@media (max-width: 1024px) {
  .brand-logo {
    width: 50px;
    height: 50px;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.9rem;
  }

  .brand-description {
    display: none;
  }

  .navigation-section {
    gap: 20px;
  }

  .nav-link {
    font-size: 0.95rem;
  }

  .actions-section {
    gap: 12px;
  }

  .language-selector {
    margin-left: 8px;
  }
}

@media (max-width: 768px) {
  .coolgym-toolbar {
    padding: 8px 16px;
  }

  .brand-logo {
    width: 40px;
    height: 40px;
  }

  .brand-title {
    font-size: 1.25rem;
  }

  .brand-subtitle {
    display: none;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .nav-links-desktop {
    display: none;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid #e5e7eb;
    border-top: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .mobile-nav-link {
    color: #4b5563;
    text-decoration: none;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
    display: block;
  }

  .mobile-nav-link:last-child {
    border-bottom: none;
  }

  .mobile-nav-link:hover {
    background-color: #f8fafc;
    color: #2563eb;
  }

  .mobile-nav-link.active {
    color: #2563eb;
    font-weight: 600;
    background-color: #eff6ff;
  }

  .icon-button {
    padding: 4px;
  }

  .icon-button i {
    font-size: 1.25rem;
  }

  .actions-section {
    gap: 8px;
  }

  .language-selector {
    margin-left: 4px;
    gap: 6px;
  }

  .language-option {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .coolgym-toolbar {
    padding: 6px 12px;
  }

  .brand-section {
    gap: 12px;
  }

  .brand-logo {
    width: 35px;
    height: 35px;
  }

  .brand-title {
    font-size: 1.1rem;
  }

  .menu-toggle {
    font-size: 1.15rem;
  }

  .language-selector {
    display: none;
  }
}
</style>
