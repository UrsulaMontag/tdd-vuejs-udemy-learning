<script setup lang="ts">
defineProps({
  label: String,
  id: String,
  help: String,
  modelValue: String
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="id">{{ label }}</label>
    <input
      class="form-control"
      type="text"
      :id="id"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="help">{{ help }}</span>
  </div>
</template>
