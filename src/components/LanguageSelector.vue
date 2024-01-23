<script setup lang="ts"></script>
<template>
  <img
    src="https://flagcdn.com/16x12/de.png"
    role="button"
    data-testid="language-de-selector"
    @click="$i18n.locale = 'de'"
  />
  <img
    src="https://flagcdn.com/16x12/gb.png"
    role="button"
    data-testid="language-en-selector"
    @click="$i18n.locale = 'en'"
  />
</template>
