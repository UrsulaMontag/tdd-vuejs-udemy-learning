<script setup lang="ts">
import axios, { AxiosError } from 'axios'
import { computed, reactive, ref, watch } from 'vue'
import UserInput from '@/components/UserInput.vue'
import { type FormStateType, type ErrorsType, type ResponseDataType } from './sign-up-types'
import { useI18n } from 'vue-i18n'
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
    const response = await axios.post<ResponseDataType>('/api/v1/users', data)
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
  <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
  <form @submit.prevent="onSubmit" class="card" data-testid="form-sign-up" v-if="!successMessage">
    <article class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
      <header class="card-header text-center">
        <h1>{{ $t('signUp') }}</h1>
      </header>
      <section class="card-body">
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

        <div class="">
          <div
            v-if="errorMessage"
            class="alert alert-danger alert-padding-y-0 h-3 lh-3"
            role="alert"
          >
            <span>{{ errorMessage }}</span>
          </div>
        </div>
        <div class="text-center">
          <button class="btn btn-primary" :disabled="isDisabled || apiProgress" type="submit">
            <span v-if="apiProgress" role="status" class="spinner-border spinner-border-sm"></span
            >{{ $t('signUp') }}
          </button>
        </div>
      </section>
    </article>
  </form>
  <div v-else class="">
    <div class="alert alert-success alert-padding-y-0 h-3 lh-3" role="alert">
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>
