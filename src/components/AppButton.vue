<template>
  <button :class="`btn btn-${variant}`" :disabled="isDisabled || apiProgress">
    <AppSpinner v-if="apiProgress" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { AppSpinner } from '.'
defineProps({
  isDisabled: Boolean,
  apiProgress: Boolean,
  variant: {
    type: String,
    default: 'primary'
  }
})
</script>
```
