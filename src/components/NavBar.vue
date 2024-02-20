<script setup lang="ts">
import http from '@/lib/http'
import { useAuthStore } from '@/stores/auth'
import { ProfileImage } from '@/components'

const { auth, logout: logoutStore } = useAuthStore()

const logout = async () => {
  logoutStore()
  try {
    await http.post('/api/v1/logout')
  } catch (error) {
    console.error('Logout failed')
  }
}
</script>

<template>
  <nav class="navbar navbar-expand bg-body-tertiary shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand" data-testid="link-home-page">
        <img src="@/assets/hoaxify.png" alt="Hoaxify logo" width="60" />Hoaxify</router-link
      >
      <ul class="navbar-nav">
        <template v-if="!auth.id">
          <li class="nav-item">
            <router-link to="/signup" class="nav-link" data-testid="link-signup-page">{{
              $t('signUp')
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/login" class="nav-link" data-testid="link-login-page">{{
              $t('login')
            }}</router-link>
          </li>
        </template>
        <template v-if="auth.id">
          <li class="nav-item">
            <router-link :to="`/user/${auth.id}`" class="nav-link" data-testid="link-my-profile">
              <ProfileImage
                :image="auth.img"
                class="rounded-circle shadow-sm"
                width="30"
                height="30"
                :alt="auth.username + ' profile'"
              />
              {{ auth.username }}</router-link
            >
          </li>
          <li class="nav-item">
            <button @click="logout" class="nav-link" data-testid="link-logout">
              {{ $t('logout') }}
            </button>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>
