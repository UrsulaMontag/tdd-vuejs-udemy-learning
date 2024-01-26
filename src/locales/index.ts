import { createI18n } from 'vue-i18n'
import en from './translations/en.json'
import de from './translations/de.json'

export const createInstance = () => {
  return createI18n({
    mode: 'composition',
    globalInjection: true,
    legacy: false,
    locale: localStorage.getItem('app-language') || navigator.language || 'en',
    fallbackLocale: 'en', // set fallback locale
    messages: {
      en,
      'en-US': en,
      de
    }
  })
}
export const i18n = createInstance()
