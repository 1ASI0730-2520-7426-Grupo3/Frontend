import { createRouter, createWebHistory } from 'vue-router'
import PageNotFoundComponent from '@/public/pages/page-not-found.component.vue'

const HomePage = () => import('@/contexts/public/presentation/pages/home-page.page.vue')
const MachinesPage = () => import('@/contexts/public/presentation/pages/machines-page.page.vue')
const RentPage = () => import('@/contexts/public/presentation/pages/rent-page.page.vue')
const ContactPage = () => import('@/contexts/public/presentation/pages/contact-page.page.vue')
const LoginPage = () => import('@/contexts/auth/presentation/pages/login-page.page.vue')
const MachineControls = () =>
  import('@/contexts/public/presentation/pages/machine-controls.page.vue')


const routes = [

  { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  {
    path: '/home',
    name: 'home',
    component: () => import('../../../contexts/public/presentation/pages/home-page.page.vue'),
  },

  { path: '/machines', name: 'machines', component: MachinesPage, meta: { requiresAuth: true } },
  { path: '/machines/:id', name: 'MachineControls', component: MachineControls, meta: { requiresAuth: true } },

  { path: '/rent', name: 'rent', component: RentPage, meta: { requiresAuth: false } },
  { path: '/contact', name: 'contact', component: ContactPage, meta: { requiresAuth: false } },

  { path: '/login', name: 'login', component: LoginPage, meta: { requiresAuth: false } },

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
    path: '/my-teams',
    name: 'my-teams',
    component: () => import('@/contexts/company/presentation/pages/my-teams.page.vue'),
    meta: { requiresAuth: true },
  },

  { path: '/:catchAll(.*)', redirect: { name: 'not-found' } },

  {path: '/', name: 'default', redirect: {name: 'home'}},
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
    next({ name: 'login' })
  } else if (!requiresAuth && isAuthenticated && to.name === 'login') {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
