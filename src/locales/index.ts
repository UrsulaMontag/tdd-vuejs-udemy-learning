import { createI18n } from 'vue-i18n'
import en from './translations/en.json'
import de from './translations/de.json'

export const i18n = createI18n({
  mode: 'composition',
  globalInjection: true,
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en,
    de
  }
})
