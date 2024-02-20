<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  image: String,
  tempImage: String
})

const path = computed(() => {
  if (props.tempImage) {
    return props.tempImage
  }
  if (props.image) {
    return `/images/${props.image}`
  }
  return '/profile.png'
})
</script>

<template>
  <img :src="path" alt="image" />
</template>
