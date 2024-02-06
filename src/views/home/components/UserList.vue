<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { loadUsers } from './api'
import { AppSpinner } from '@/components'
import { type PageData } from './types/pageData'
import { UserItem } from './UserItem.vue'

const pageData = reactive<PageData>({
  content: [],
  page: 0,
  size: 0,
  totalPages: 0
})

const apiProgress = ref(true)

onMounted(async () => {
  loadData()
})

const loadData = async (pageIndex?: number | undefined) => {
  apiProgress.value = true
  const {
    data: { content, page, size, totalPages }
  } = await loadUsers(pageIndex)
  pageData.content = content
  pageData.page = page
  pageData.size = size
  pageData.totalPages = totalPages
  apiProgress.value = false
}
</script>

<template>
  <div class="card">
    <div class="card-header text-center">
      <h1 class="card-title">{{ $t('userList.header') }}</h1>
    </div>
    <ul class="list-group list-group-flush">
      <UserItem
      <!-- <li
        class="list-group-item list-group-item-action"
        v-for="user in pageData.content"
        :key="user.id"
      >
        {{ user.username }}
      </li> -->
    </ul>
    <div class="card-footer text-center">
      <AppSpinner v-if="apiProgress" size="normal" />
      <button
        class="btn btn-outline-secondary btn-sm float-start"
        @click="loadData(pageData.page - 1)"
        v-if="pageData.page !== 0"
      >
        {{ $t('userList.previous') }}
      </button>
      <button
        class="btn btn-outline-secondary btn-sm float-end"
        @click="loadData(pageData.page + 1)"
        v-if="pageData.page + 1 < pageData.totalPages"
      >
        {{ $t('userList.next') }}
      </button>
    </div>
  </div>
</template>
