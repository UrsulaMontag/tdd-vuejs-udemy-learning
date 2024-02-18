<template>
  <nav class="navbar navbar-expand bg-body-tertiary shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand" data-testid="link-home-page">
        <img src="@/assets/hoaxify.png" alt="Hoaxify logo" width="60" />Hoaxify</router-link
      >
      <ul class="navbar-nav">
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
      </ul>
    </div>
  </nav>
</template>
