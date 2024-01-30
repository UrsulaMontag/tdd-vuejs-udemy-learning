<script setup lang="ts">
import { LanguageSelector, NavBar } from './components'
</script>

<template>
  <NavBar />
  <main class="container mt-3">
    <LanguageSelector />

    <router-view />
  </main>
</template>

<style scoped></style>
