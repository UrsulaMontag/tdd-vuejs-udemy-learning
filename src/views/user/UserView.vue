<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppAlert, AppCard, AppSpinner } from '@/components'
import { fetchUser } from './api'

const { t } = useI18n()
const route = useRoute()

const errorMessage = ref<string | undefined>()
const successMessage = ref<string | undefined>()
const status = ref<string>('')
const userId = ref<string | string[]>('')

watchEffect(async () => {
  status.value = 'loading'
  try {
    const response = await fetchUser(route.params.id)
    successMessage.value = response?.data?.message
    userId.value = route.params.id
    console.log(route.name)
    status.value = 'success'
  } catch (error) {
    status.value = 'fail'
    if (error instanceof AxiosError && error.response?.data.message) {
      errorMessage.value = error?.response?.data?.message
    } else {
      errorMessage.value = t('genericError')
    }
  }
})
</script>

<template>
  <div data-testid="user-page">
    <AppAlert v-if="status === 'fail'" variant="danger">{{ errorMessage }}</AppAlert>
    <AppAlert v-if="status === 'loading'" variant="secondary" center>
      <AppSpinner size="normal" />
    </AppAlert>
    <AppCard v-if="status === 'success'">
      <template v-slot:header>
        <img src="@/assets/profile.png" alt="profile" width="90" class="rounded-circle shadow-sm" />
      </template>
      <template v-slot:body>
        <div class="text-center">
          <span>{{ $t('userList.user') + ' ' + userId }}</span>
        </div>
      </template>
    </AppCard>
  </div>
</template>
