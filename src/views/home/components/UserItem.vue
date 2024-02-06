<template>
  <li class="list-group-item list-group-item-action">
    {{ user.username }}
  </li>
</template>

<script lang="ts">
import { type PropType, defineProps } from 'vue'
import type { User } from './types/user'

defineProps({
  user: {
    type: Object as () => PropType<User>,
    required: true,
    default: () => ({ username: '' })
  }
})
</script>
