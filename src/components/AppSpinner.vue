<template>
  <span
    class="spinner-border"
    :class="{ 'spinner-border-sm': size === 'small' }"
    role="status"
  ></span>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'small'
  }
})
</script>
