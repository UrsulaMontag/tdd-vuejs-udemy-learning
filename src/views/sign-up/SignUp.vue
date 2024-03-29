<script setup lang="ts">
import { AxiosError } from 'axios'
import { computed, reactive, ref, watch } from 'vue'
import { AppAlert, AppButton, AppCard, UserInput } from '@/components'
import { type FormStateType, type ErrorsType } from '@/shared/types/api-error-types'
import { useI18n } from 'vue-i18n'
import { signUp } from './api'

const { t } = useI18n()
const formState = reactive<FormStateType>({
  username: '',
  email: '',
  password: '',
  passwordRepeat: ''
})

const apiProgress = ref(false)
const errorMessage = ref<string | undefined>(undefined)
const successMessage = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({})

//computed allows to only run into the function when the value changes
const isDisabled = computed(() => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true
})

const passwordMissmatchError = computed(() => {
  return formState.password !== formState.passwordRepeat ? t('passwordMismatch') : undefined
})

const helpValue = computed(() => {
  return (errors.value as any).username
})

watch([() => formState.username, () => formState.email, () => formState.password], () => {
  if (('username' in errors.value) as any) delete (errors.value as any).username
  if (('email' in errors.value) as any) delete (errors.value as any).email
  if (('password' in errors.value) as any) delete (errors.value as any).password
})

const onSubmit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordRepeat: _, ...data } = formState //destructuring
  try {
    const response = await signUp(data)
    // receives response message from the backend server
    successMessage.value = response?.data?.message
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 400) {
      errors.value = error?.response?.data?.validationErrors
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
</script>

<template>
  <div data-testid="sign-up-page" class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
    <form @submit.prevent="onSubmit" data-testid="form-sign-up" v-if="!successMessage">
      <AppCard>
        <template v-slot:header>
          <h1>{{ $t('signUp') }}</h1>
        </template>
        <template v-slot:body>
          <UserInput
            :label="$t('username')"
            id="username"
            :help="helpValue"
            v-model="formState.username"
          />
          <UserInput
            :label="$t('email')"
            id="email"
            :help="'email' in errors ? (errors.email as string) : undefined"
            v-model="formState.email"
          />
          <UserInput
            :label="$t('password')"
            id="password"
            :help="'password' in errors ? (errors.password as string) : undefined"
            v-model="formState.password"
          />
          <UserInput
            :label="$t('passwordRepeat')"
            id="passwordRepeat"
            :help="passwordMissmatchError"
            v-model="formState.passwordRepeat"
          />

          <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

          <div class="text-center">
            <AppButton :is-disabled="isDisabled || apiProgress" :api-progress="apiProgress">
              {{ $t('signUp') }}</AppButton
            >
          </div>
        </template>
      </AppCard>
    </form>
    <AppAlert v-else variant="success">{{ successMessage }}</AppAlert>
  </div>
</template>
