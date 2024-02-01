<template>
  <div class="alert" :class="`alert-${variant} ${center ? 'text-center' : ''}`">
    <!--for entering child nodes, we have to define slots-->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'success'
  },
  center: {
    type: Boolean,
    default: false
  }
})
</script>
