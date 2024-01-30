<template>
  <div data-testid="activation-page"><h1>Activation</h1></div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted } from 'vue'
onMounted(() => {
  axios.patch('/api/v1/users/this-will-be-taken-from-url/active')
})
</script>
