<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const setLanguage = (language: string) => {
  localStorage.setItem('app-language', language)
  locale.value = language
}
</script>

<template>
  <img
    src="https://flagcdn.com/16x12/de.png"
    role="button"
    data-testid="language-de-selector"
    @click="setLanguage('de')"
  />
  <img
    src="https://flagcdn.com/16x12/gb.png"
    role="button"
    data-testid="language-en-selector"
    @click="setLanguage('en')"
  />
</template>
