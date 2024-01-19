<script setup lang="ts">
import axios from 'axios';
import { computed, reactive, ref } from 'vue';

const formState = reactive( {
  username: '',
  email: '',
  password: '',
  passwordRepeat: ''
} );

const apiProgress = ref( false );
const isSubmitted = ref( false );
const successMessage = ref();

//computed allows to only run into the function when the value changes
const isDisabled = computed( () => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true;
} );

const onSubmit = async () => {
  apiProgress.value = true;
  isSubmitted.value = true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordRepeat: _, ...data } = formState; //destructuring
  const response = await axios.post( '/api/v1/users', data );
  // receives response message from the backend server
  successMessage.value = response?.data?.message;
};
</script>

<template>
  <!-- v-show is not removing the element from the DOM, it just hides it. that means v-show has better 
    performance when toggling the view of the element often than v-if -->
  <form @submit.prevent=" onSubmit " class="card" data-testid="form-sign-up" v-if=" !successMessage ">
    <article class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
      <header class="card-header text-center">
        <h1>Sign Up</h1>
      </header>
      <section class="card-body">
        <div class="mb-3">
          <label class="form-label" for="username">Username</label>
          <input class="form-control" type="text" id="username" v-model=" formState.username " />
        </div>
        <div class="mb-3">
          <label class="form-label" for="email">Email</label>
          <input class="form-control" type="email" id="email" v-model=" formState.email " />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Password</label>
          <input class="form-control" type="password" id="password" v-model=" formState.password " />
        </div>
        <div class="mb-3">
          <label class="form-label" for="passwordRepeat">Password Repeat</label>
          <input class="form-control" type="password" id="passwordRepeat" v-model=" formState.passwordRepeat " />
        </div>
        <div class="text-center">
          <button class="btn btn-primary" :disabled=" isDisabled || apiProgress " type="submit">
            <span v-if=" apiProgress " role="status" class="spinner-border spinner-border-sm"></span>Sign Up</button>
        </div>

      </section>
    </article>
  </form>
  <aside v-else class="">
    <div class="alert alert-success alert-padding-y-0 h-3 lh-3" role="alert">
      <span>{{ successMessage }}</span>
    </div>
  </aside>
</template>
