<script setup lang="ts">
import axios, { AxiosError } from 'axios'
import { computed, reactive, ref } from 'vue'
import UserInput from '@/components/UserInput.vue'

type ErrorsType = { validationErrors: any } | AxiosError

const formState = reactive({
  username: '',
  email: '',
  password: '',
  passwordRepeat: ''
})

const apiProgress = ref(false)
const errorMessage = ref<string | undefined>(undefined)
const successMessage = ref<string | undefined>(undefined)
const errors = ref<ErrorsType>({ validationErrors: null })

//computed allows to only run into the function when the value changes
const isDisabled = computed(() => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true
})

const onSubmit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordRepeat: _, ...data } = formState //destructuring
  try {
    const response = await axios.post('/api/v1/users', data)
    // receives response message from the backend server
    successMessage.value = response?.data?.message
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 400) {
      errors.value = error?.response?.data?.validationErrors
    } else {
      errorMessage.value = 'Unexpected error occured. Please try again.'
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
        <h1>Sign Up</h1>
      </header>
      <section class="card-body">
        <UserInput
          label="Username"
          id="username"
          :help="'username' in errors ? (errors.username as string) : undefined"
          v-model="formState.username"
        />
        <!-- <div class="mb-3">
          <label class="form-label" for="username">Username</label>
          <input class="form-control" type="text" id="username" v-model=" formState.username " />
          <div v-if=" errors && 'username' in errors ">{{ errors.username }}</div>
        </div> -->
        <div class="mb-3">
          <label class="form-label" for="email">Email</label>
          <input class="form-control" type="email" id="email" v-model="formState.email" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Password</label>
          <input class="form-control" type="password" id="password" v-model="formState.password" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="passwordRepeat">Password Repeat</label>
          <input
            class="form-control"
            type="password"
            id="passwordRepeat"
            v-model="formState.passwordRepeat"
          />
        </div>
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
            >Sign Up
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
