<script setup lang="ts">
import { AxiosError } from 'axios'
import { computed, ref, watch } from 'vue'
import { AppButton, UserInput, AppAlert } from '@/components'
import { type ErrorsType } from '@/shared/types/api-error-types'
import { useI18n } from 'vue-i18n'
import { setPassword } from './api'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref<string>('')
const passwordRepeat = ref<string>('')
const apiProgress = ref(false)
const errorMessage = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({})

const onSubmit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  try {
    await setPassword(route.query.tk, { password: password.value })
    router.push('/login')
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.validationErrors) {
      errors.value = error?.response?.data?.validationErrors
    } else if (error instanceof AxiosError && error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
watch(
  () => password.value,
  () => {
    'password' in errors.value && delete errors.value.password
  }
)

const isDisabled = computed(() => {
  return password.value || passwordRepeat.value ? password.value !== passwordRepeat.value : true
})
const passwordMatchError = computed(() => {
  return password.value !== passwordRepeat.value ? t('passwordMismatch') : ''
})
</script>

<template>
  <div data-testid="reset-password-set-page" class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
    <form @submit.prevent="onSubmit" class="card" data-testid="form-reset-password-set">
      <header class="card-header text-center">
        <h1>{{ $t('passwordSet') }}</h1>
      </header>
      <section class="card-body">
        <UserInput
          :label="$t('newPassword')"
          id="password"
          :help="'password' in errors ? (errors.password as string) : undefined"
          v-model="password"
        />
        <UserInput
          :label="$t('newPasswordRepeat')"
          id="passwordRepeat"
          :help="passwordMatchError"
          v-model="passwordRepeat"
        />
        <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>
        <div class="text-center">
          <AppButton :is-disabled="isDisabled" :api-progress="apiProgress">{{
            $t('passwordSet')
          }}</AppButton>
        </div>
      </section>
    </form>
  </div>
</template>
