import { createRouter, createWebHistory } from 'vue-router'
import PageNotFoundComponent from '@/public/pages/page-not-found.component.vue'

const HomePage = () => import('@/contexts/public/presentation/pages/home-page.page.vue')
const MachinesPage = () => import('@/contexts/public/presentation/pages/machines-page.page.vue')
const RentPage = () => import('@/contexts/public/presentation/pages/rent-page.page.vue')
const ContactPage = () => import('@/contexts/public/presentation/pages/contact-page.page.vue')
const LandingPage = () => import('@/contexts/public/presentation/pages/landing.page.vue')
const LoginPage = () => import('@/contexts/auth/presentation/pages/login-page.page.vue')
const RegisterPage = () => import('@/contexts/auth/presentation/pages/register-page.page.vue')
const MachineControls = () =>
  import('@/contexts/public/presentation/pages/machine-controls.page.vue')


const routes = [
  // Root redirect to landing
  { path: '/', redirect: { name: 'landing' } },

  // ========== PUBLIC ROUTES (No auth required) ==========
  { path: '/landing', name: 'landing', component: LandingPage, meta: { requiresAuth: false } },
  { path: '/login/:role?', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
  { path: '/register/:role?', name: 'register', component: RegisterPage, meta: { requiresAuth: false } },
  { path: '/rent', name: 'rent', component: RentPage, meta: { requiresAuth: false } },
  { path: '/contact', name: 'contact', component: ContactPage, meta: { requiresAuth: false } },

  // ========== DYNAMIC HOME (Redirects based on role) ==========
  {
    path: '/home',
    name: 'home',
    redirect: () => {
      const userRole = localStorage.getItem('userRole')
      return userRole === 'provider' ? { name: 'provider-home' } : { name: 'client-home' }
    },
  },

  // ========== CLIENT ROUTES ==========
  {
    path: '/client/home',
    name: 'client-home',
    component: HomePage,
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
    component: () => import('@/contexts/account-statement/presentation/pages/account-statement.page.vue'),
    meta: { requiresAuth: true, role: 'client' },
  },

  // ========== PROVIDER ROUTES ==========
  {
    path: '/provider/home',
    name: 'provider-home',
    component: HomePage,
    meta: { requiresAuth: true, role: 'provider' },
  },
  {
    path: '/my-teams',
    name: 'my-teams',
    component: () => import('@/contexts/company/presentation/pages/my-teams.page.vue'),
    meta: { requiresAuth: true, role: 'provider' },
  },

  // ========== SHARED ROUTES (Both roles) ==========
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/contexts/profile/presentation/pages/profile.page.vue'),
    meta: { requiresAuth: true },
  },

  // ========== 404 NOT FOUND ==========
  { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundComponent, meta: { requiresAuth: false } },
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
  if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'landing' || to.name === 'register')) {
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
