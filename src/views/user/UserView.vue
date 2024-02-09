<script setup lang="ts">
import { AppAlert, AppSpinner } from '@/components'
import { fetchUser } from './api'
import ProfileCard from './components/ProfileCard.vue'
import useRouteParamsApiRequest from '@/shared/useRouteParamsApiRequest'

const { status, data, error } = useRouteParamsApiRequest(fetchUser, 'id')
</script>

<template>
  <div data-testid="user-page">
    <AppAlert v-if="status === 'fail'" variant="danger">{{ error }}</AppAlert>
    <AppAlert v-if="status === 'loading'" variant="secondary" center>
      <AppSpinner size="normal" />
    </AppAlert>
    <ProfileCard v-if="status === 'success'" :user="data" />
  </div>
</template>
