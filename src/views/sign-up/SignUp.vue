<script setup lang="ts">
import axios from 'axios';
import { computed, reactive } from 'vue';

const formState = reactive( {
  username: '',
  email: '',
  password: '',
  passwordRepeat: ''
} );

//computed allows to only run into the function when the value changes
const isDisabled = computed( () => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true;
} );

const onSubmit = () => {
  const { passwordRepeat: _, ...data } = formState; //destructuring
  axios.post( ' /api/v1/users', data );
};
</script>

<template>
  <form @submit.prevent=" onSubmit " class="card">
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
          <button class="btn btn-primary" :disabled=" isDisabled " type="submit">Sign Up</button>
        </div>
      </section>
    </article>
  </form>
</template>
