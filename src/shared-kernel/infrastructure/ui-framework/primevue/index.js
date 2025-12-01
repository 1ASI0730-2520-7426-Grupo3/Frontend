import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Lara from '@primeuix/themes/lara'
import ToastService from 'primevue/toastservice'

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

  app.use(ToastService)

  app.component('pv-button', Button)
  app.component('pv-toolbar', Toolbar)
}
