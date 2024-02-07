<template>
  <li
    class="list-group-item list-group-item-action"
    data-testid="user-item"
    @click="router.push(`/user/${user.id}`)"
  >
    <img src="@/assets/profile.png" alt="profile" width="30" class="rounded-circle shadow-sm" />
    {{ 'username' in user && user.username }}
  </li>
</template>

<script setup lang="ts">
import { type PropType, defineProps, ref } from 'vue'
import type { User } from './types/user'
import { useRouter } from 'vue-router'

defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
    default: () => ({ user: { username: '', id: -1 } })
  }
})
const router = useRouter()
</script>
<style scoped>
li {
  cursor: pointer;
}
</style>
