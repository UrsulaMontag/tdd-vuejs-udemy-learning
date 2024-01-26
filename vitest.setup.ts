import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)

import { i18n } from '@/locales'
import { computed, ref } from 'vue'
afterEach(() => {
  // Create a ref with the initial value 'en'
  const locale = ref<'en' | 'de'>('en')

  // Create a computed property based on the ref
  const localeComputed = computed({
    get: () => locale.value,
    set: (value) => {
      locale.value = value
    }
  })

  // Assign the computed property to i18n.global.locale
  i18n.global.locale = localeComputed
  locale.value = 'en'
})
