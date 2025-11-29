/**
 * Summary: Vue I18n configuration for internationalization
 * Provides EN/ES translations for the application
 */
import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es from './locales/es'

const messages = {
  en,
  es,
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
