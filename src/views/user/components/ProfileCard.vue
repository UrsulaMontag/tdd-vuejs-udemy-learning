<script setup lang="ts">
import { AppCard, AppButton } from '@/components'
import DeleteUserButton from './DeleteUserButton.vue'
import { useAuthStore } from '@/stores/auth'
defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ user: { username: '', id: -1 } })
  }
})

const { auth } = useAuthStore()
</script>

<template>
  <AppCard>
    <template v-slot:header>
      <img src="@/assets/profile.png" alt="profile" width="90" class="rounded-circle shadow-sm" />
    </template>
    <template v-slot:body>
      <div class="text-center">
        <h3>{{ user.username }}</h3>
        <AppButton v-if="auth.id === user.id">{{ $t('edit') }}</AppButton>
        <div class="mt-3"></div>
        <DeleteUserButton :id="user.id" />
      </div>
    </template>
  </AppCard>
</template>
