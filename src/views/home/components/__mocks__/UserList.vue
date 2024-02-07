<template>
  <UserItem v-for="user in pageData.content" :key="user.id" :user="user" />
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import type { PageData } from '../types/pageData'
import UserItem from '../UserItem.vue'

const pageData = reactive<PageData>({
  content: [{ id: 1, username: 'test user' }],
  page: 0,
  size: 0,
  totalPages: 0
})
</script>
