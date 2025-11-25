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
  { path: '/', redirect: { name: 'landing' } },

  { path: '/landing', name: 'landing', component: LandingPage, meta: { requiresAuth: false } },
  { path: '/login/:role?', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
  { path: '/register/:role?', name: 'register', component: RegisterPage, meta: { requiresAuth: false } },

  { path: '/home', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/machines', name: 'machines', component: MachinesPage, meta: { requiresAuth: true } },
  { path: '/machines/:id', name: 'MachineControls', component: MachineControls, meta: { requiresAuth: true } },

  { path: '/rent', name: 'rent', component: RentPage, meta: { requiresAuth: false } },
  { path: '/contact', name: 'contact', component: ContactPage, meta: { requiresAuth: false } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundComponent, meta: { requiresAuth: false } },

  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/contexts/maintenance/presentation/pages/maintenance-page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account-statement',
    name: 'account-statement',
    component: () => import('@/contexts/account-statement/presentation/pages/account-statement.page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/add-equipment',
    name: 'add-equipment',
    component: () => import('@/contexts/equipment/presentation/pages/add-equipment.page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-teams',
    name: 'my-teams',
    component: () => import('@/contexts/company/presentation/pages/my-teams.page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/contexts/profile/presentation/pages/profile.page.vue'),
    meta: { requiresAuth: true },
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
  const requiresAuth = to.meta.requiresAuth ?? true

  if (requiresAuth && !isAuthenticated) {
    // Redirect to landing page if not authenticated
    next({ name: 'landing' })
  } else if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'landing' || to.name === 'register')) {
    // If already authenticated, don't allow access to login/landing/register
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
