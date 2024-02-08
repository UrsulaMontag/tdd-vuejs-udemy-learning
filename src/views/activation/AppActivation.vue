<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppAlert, AppSpinner } from '@/components'
import { activate } from './api'

const { t } = useI18n()
const route = useRoute()

const errorMessage = ref<string | undefined>()
const successMessage = ref<string | undefined>()
const status = ref<string>('')

watchEffect(async () => {
  status.value = 'loading'
  try {
    const response = await activate(route.params.token)
    successMessage.value = response?.data?.message
    status.value = 'success'
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data.message) {
      errorMessage.value = error?.response?.data?.message
    } else {
      errorMessage.value = t('genericError')
    }
    status.value = 'fail'
  }
})
</script>

<template>
  <div data-testid="activation-page">
    <AppAlert v-if="status === 'fail'" variant="danger">{{ errorMessage }}</AppAlert>
    <AppAlert v-if="status === 'success'">{{ successMessage }}</AppAlert>
    <AppAlert v-if="status === 'loading'" variant="secondary" center>
      <AppSpinner size="normal" />
    </AppAlert>
  </div>
</template>
