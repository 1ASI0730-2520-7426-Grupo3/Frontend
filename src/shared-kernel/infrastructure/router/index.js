import { createRouter, createWebHistory } from 'vue-router'
import PageNotFoundComponent from '@/public/pages/page-not-found.component.vue'

const ClientHomePage = () => import('@/contexts/client/presentation/pages/client-home.page.vue')
const RentPage = () => import('@/contexts/rent/presentation/pages/rent-page.page.vue')
const ContactPage = () => import('@/contexts/public/presentation/pages/contact-page.page.vue')
const LandingPage = () => import('@/contexts/public/presentation/pages/landing.page.vue')
const LoginPage = () => import('@/contexts/auth/presentation/pages/login-page.page.vue')
const RegisterPage = () => import('@/contexts/auth/presentation/pages/register-page.page.vue')
const MachineControls = () =>
  import('@/contexts/public/presentation/pages/machine-controls.page.vue')

const routes = [
  { path: '/', redirect: { name: 'landing' } },

  { path: '/landing', name: 'landing', component: LandingPage, meta: { requiresAuth: false } },
  { path: '/login/:role?', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
  {
    path: '/register/:role?',
    name: 'register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  { path: '/rent', name: 'rent', component: RentPage, meta: { requiresAuth: false } },
  { path: '/contact', name: 'contact', component: ContactPage, meta: { requiresAuth: false } },

  {
    path: '/home',
    name: 'home',
    redirect: () => {
      const userRole = localStorage.getItem('userRole')
      return userRole === 'provider' ? { name: 'provider-home' } : { name: 'client-home' }
    },
  },

  {
    path: '/client/home',
    name: 'client-home',
    component: ClientHomePage,
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/my-machines',
    name: 'my-machines',
    component: () => import('@/contexts/equipment/presentation/pages/my-machines.page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/machines/:id',
    name: 'MachineControls',
    component: MachineControls,
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/add-equipment',
    name: 'add-equipment',
    component: () => import('@/contexts/equipment/presentation/pages/add-equipment.page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/contexts/maintenance/presentation/pages/maintenance-page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/account-statement',
    name: 'account-statement',
    component: () =>
      import('@/contexts/account-statement/presentation/pages/account-statement.page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/contexts/rent/presentation/pages/notifications.page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },

  {
    path: '/provider/home',
    name: 'provider-home',
    component: () => import('@/contexts/provider/presentation/pages/provider-home.page.vue'),
    meta: { requiresAuth: true, role: 'provider' },
  },
  {
    path: '/provider/requests',
    name: 'provider-requests',
    component: () => import('@/contexts/provider/presentation/pages/provider-requests.page.vue'),
    meta: { requiresAuth: true, role: 'provider' },
  },
  {
    path: '/my-teams',
    name: 'my-teams',
    component: () => import('@/contexts/provider/presentation/pages/my-clients-teams.page.vue'),
    meta: { requiresAuth: true, role: 'provider' },
  },
  {
    path: '/work-orders',
    name: 'work-orders',
    component: () => import('@/contexts/provider/presentation/pages/work-orders.page.vue'),
    meta: { requiresAuth: true, role: 'provider' },
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/contexts/profile/presentation/pages/profile.page.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFoundComponent,
    meta: { requiresAuth: false },
  },
  { path: '/:catchAll(.*)', redirect: { name: 'not-found' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole') // 'client' or 'provider'
  const requiresAuth = to.meta.requiresAuth ?? true

  // Not authenticated - redirect to landing
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'landing' })
    return
  }

  // Authenticated users can't access landing/login/register
  if (
    !requiresAuth &&
    isAuthenticated &&
    (to.name === 'login' || to.name === 'landing' || to.name === 'register')
  ) {
    next({ name: 'home' })
    return
  }

  // Role-based access control
  if (to.meta.role && to.meta.role !== userRole) {
    // User trying to access wrong role's page - redirect to their home
    next({ name: `${userRole}-home` })
    return
  }

  next()
})

export default router
