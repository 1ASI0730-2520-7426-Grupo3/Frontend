import { createApp } from 'vue'
import App from './App.vue'
import './app/global.css'

import 'primeicons/primeicons.css'
import { setupPrimeVue } from './shared-kernel/infrastructure/ui-framework/primevue'
import router from './shared-kernel/infrastructure/router'
import i18n from './shared-kernel/infrastructure/i18n'

const app = createApp(App)

setupPrimeVue(app, 'aura')
app.use(router)
app.use(i18n)
app.mount('#app')
