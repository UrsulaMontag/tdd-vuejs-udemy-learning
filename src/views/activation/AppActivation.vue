<script setup lang="ts">
import { AppAlert, AppSpinner } from '@/components'
import { activate } from './api'
import useRouteParamsApiRequest from '@/shared/useRouteParamsApiRequest'

const { status, data, error } = useRouteParamsApiRequest(activate, 'token')
</script>

<template>
  <div data-testid="activation-page">
    <AppAlert v-if="status === 'fail'" variant="danger">{{ error }}</AppAlert>
    <AppAlert v-if="status === 'success'">{{ data && 'message' in data && data.message }}</AppAlert>
    <AppAlert v-if="status === 'loading'" variant="secondary" center>
      <AppSpinner size="normal" />
    </AppAlert>
  </div>
</template>
