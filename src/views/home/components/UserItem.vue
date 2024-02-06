<template>
  <li class="list-group-item list-group-item-action">
    <img src="@/assets/profile.png" alt="profile" width="30" class="rounded-circle shadow-sm" />
    {{ 'username' in user && user.username }}
  </li>
</template>

<script setup lang="ts">
import { type PropType, defineProps, ref } from 'vue'
import type { User } from './types/user'

defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
    default: () => ({ user: { username: '', id: -1 } })
  }
})
</script>
