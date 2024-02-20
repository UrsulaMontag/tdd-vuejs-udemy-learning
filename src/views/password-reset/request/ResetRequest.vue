<script setup lang="ts">
import { ref, watch } from 'vue'
import { AppAlert, AppButton, AppCard, UserInput } from '@/components'
import { type ErrorsType } from '@/shared/types/api-error-types'
import { useI18n } from 'vue-i18n'
import { passwordReset } from './api'
import { AxiosError } from 'axios'

const { t } = useI18n()

const email = ref<string>('')
const apiProgress = ref(false)
const errorMessage = ref<string | undefined>(undefined)
const successMessage = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({})

watch(
  () => email.value,
  () => {
    if (('email' in errors.value) as any) delete (errors.value as any).email
  }
)

const onSubmit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  try {
    const response = await passwordReset({ email: email.value })
    // receives response message from the backend server
    successMessage.value = response?.data?.message
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data.validationErrors) {
      errors.value = error.response?.data?.validationErrors
    } else if (error instanceof AxiosError && error.response?.data.message) {
      errorMessage.value = error.response?.data.message
    } else {
      errorMessage.value = t('genericError')
    }
  } finally {
    apiProgress.value = false
  }
}
</script>

<template>
  <div data-testid="reset-password-request-page" class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
    <form @submit.prevent="onSubmit" data-testid="form-reset-password-request">
      <AppCard>
        <template v-slot:header>
          <h1>{{ $t('passwordReset') }}</h1>
        </template>
        <template v-slot:body>
          <UserInput
            :label="$t('email')"
            id="email"
            :help="'email' in errors ? (errors.email as string) : undefined"
            v-model="email"
            type="email"
          />
          <AppAlert v-if="successMessage">{{ successMessage }}</AppAlert>
          <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>
          <div class="text-center">
            <AppButton :is-disabled="!email || apiProgress" :api-progress="apiProgress">
              {{ $t('passwordReset') }}
            </AppButton>
          </div>
        </template>
      </AppCard>
    </form>
  </div>
</template>
