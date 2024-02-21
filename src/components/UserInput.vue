<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: String,
  id: String,
  help: String,
  modelValue: String,
  type: String
})
defineEmits(['update:modelValue', 'change'])
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="id">{{ label }}</label>
    <input
      class="form-control"
      :class="{ 'is-invalid': help }"
      :type="type"
      :id="id"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :value="modelValue"
      @change="$emit('change', $event)"
    />
    <span data-testid="input-error-message" class="invalid-feedback" v-if="help">{{ help }}</span>
  </div>
</template>
