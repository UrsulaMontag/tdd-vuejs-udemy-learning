<script setup lang="ts">
import AppCard from '@/components/AppCard.vue'
defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ user: { username: '', id: -1 } })
  }
})
</script>

<template>
  <AppCard>
    <template v-slot:header>
      <img src="@/assets/profile.png" alt="profile" width="90" class="rounded-circle shadow-sm" />
    </template>
    <template v-slot:body>
      <div class="text-center">
        <span>{{ user.username }}</span>
      </div>
    </template>
  </AppCard>
</template>
