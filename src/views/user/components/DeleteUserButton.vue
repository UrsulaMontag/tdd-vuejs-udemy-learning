<script setup lang="ts">
import { AppAlert, AppButton } from '@/components'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { deleteUser } from './api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  id: Number
})

const { t } = useI18n()
const { auth, logout } = useAuthStore()
const router = useRouter()

const apiProgress = ref<boolean>(false)
const error = ref<string | undefined>()

const onClickDelete = async () => {
  error.value = undefined
  const response = confirm(t('deleteUser.confirm'))
  if (response) {
    try {
      apiProgress.value = true
      await deleteUser(auth.id)
      logout()
      router.push('/')
    } catch {
      error.value = t('genericError')
      apiProgress.value = false
    }
  }
}
</script>

<template>
  <AppButton
    v-if="auth.id === id"
    variant="danger"
    @click="onClickDelete"
    :api-progress="apiProgress"
    >{{ t('deleteUser.button') }}</AppButton
  >
  <AppAlert v-if="error" variant="danger">{{ error }}</AppAlert>
</template>
