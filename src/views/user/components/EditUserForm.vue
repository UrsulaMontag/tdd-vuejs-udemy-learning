<script setup lang="ts">
import { AppAlert, AppButton, UserInput } from '@/components'
import type { ErrorsType } from '@/shared/types/api-error-types'
import { useAuthStore } from '@/stores/auth'
import { AxiosError } from 'axios'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateUser } from './api'

const { t } = useI18n()
const { auth, update } = useAuthStore()

const emit = defineEmits(['cancel', 'save', 'newImg'])
const username = ref<string | undefined>(auth.username)
const apiProgress = ref<boolean>(false)
const error = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({})

const onSubmit = async () => {
  apiProgress.value = true
  error.value = undefined
  try {
    await updateUser(auth.id, { username: username.value })
    update({ id: auth.id, username: username.value })
    emit('save')
  } catch (apiError) {
    apiProgress.value = false
    if (apiError instanceof AxiosError && apiError.response?.status === 400) {
      errors.value = apiError?.response?.data?.validationErrors
    } else {
      error.value = t('genericError')
    }
  }
}

const onImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  const fileReader = new FileReader()
  fileReader.onloadend = () => {
    const data = fileReader.result
    emit('newImg', data)
  }
  fileReader.readAsDataURL(file as Blob)
}

watch(
  () => username.value,
  () => {
    'username' in errors.value && delete errors.value.username
  }
)
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UserInput
      :label="$t('username')"
      id="username"
      v-model="username"
      :help="'username' in errors ? errors.username : undefined"
    />
    <UserInput id="file" :label="$t('selectImage')" type="file" @change="onImageChange" />
    <AppAlert v-if="error" variant="danger">{{ error }}</AppAlert>
    <AppButton type="submit" :api-progress="apiProgress">{{ $t('save') }}</AppButton>
    <div class="d-inline m-1"></div>
    <AppButton type="button" variant="outline-secondary" @click="$emit('cancel')">{{
      $t('cancel')
    }}</AppButton>
  </form>
</template>
