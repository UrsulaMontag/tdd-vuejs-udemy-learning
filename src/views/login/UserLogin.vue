<script setup lang="ts">
import { AxiosError } from 'axios'
import { computed, reactive, ref, watch } from 'vue'
import { AppAlert, AppButton, AppCard, UserInput } from '@/components'
import { type FormStateType, type ErrorsType } from '@/shared/types/api-error-types'
import { useI18n } from 'vue-i18n'
import { login } from './api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const formState = reactive<FormStateType>({
  email: '',
  password: ''
})
const { setLoggedIn } = useAuthStore()

const apiProgress = ref(false)
const errorMessage = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({})

const isDisabled = computed(() => {
  return !formState.email && !formState.password
})
watch([() => formState.username, () => formState.email, () => formState.password], () => {
  if (('email' in errors.value) as any) delete (errors.value as any).email
  if (('password' in errors.value) as any) delete (errors.value as any).password
})

const onSubmit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  const { ...data } = formState
  try {
    const response = await login(data)
    setLoggedIn(response.data)
    router.push('/')
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 400) {
      errors.value = error?.response?.data?.validationErrors
    } else if ((error as any).response?.data?.message) {
      errorMessage.value = (error as any).response.data.message
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
</script>

<template>
  <div data-testid="login-page" class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
    <form @submit.prevent="onSubmit" data-testid="form-login">
      <AppCard>
        <template v-slot:header>
          <h1>{{ $t('login') }}</h1>
        </template>
        <template v-slot:body>
          <UserInput
            :label="$t('email')"
            id="email"
            :help="'email' in errors ? (errors.email as string) : undefined"
            v-model="formState.email"
            type="email"
          />
          <UserInput
            :label="$t('password')"
            id="password"
            :help="'password' in errors ? (errors.password as string) : undefined"
            v-model="formState.password"
            type="password"
          />

          <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

          <div class="text-center">
            <AppButton :is-disabled="isDisabled || apiProgress" :api-progress="apiProgress">
              {{ $t('login') }}</AppButton
            >
          </div>
        </template>
        <template v-slot:footer>
          <router-link to="/password-reset/request">{{
            $t('forgotPassword')
          }}</router-link></template
        >
      </AppCard>
    </form>
  </div>
</template>
