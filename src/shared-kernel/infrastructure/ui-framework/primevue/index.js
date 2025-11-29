import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Lara from '@primeuix/themes/lara'
import ToastService from 'primevue/toastservice'

// Only import components we actually use
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'

export const themes = {
  aura: Aura,
  lara: Lara,
}

export function setupPrimeVue(app, selectedTheme = 'aura') {
  const preset = themes[selectedTheme] || themes.aura

  app.use(PrimeVue, {
    theme: {
      preset,
      options: {
        prefix: '',
        cssLayer: false,
      },
    },
  })

  // Register Toast service
  app.use(ToastService)

  // Only register components we actually use
  app.component('pv-button', Button)
  app.component('pv-toolbar', Toolbar)
}
