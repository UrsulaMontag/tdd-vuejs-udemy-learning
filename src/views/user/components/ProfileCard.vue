<script setup lang="ts">
import { AppCard, AppButton, ProfileImage } from '@/components'
import DeleteUserButton from './DeleteUserButton.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import EditUserForm from './EditUserForm.vue'
const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ user: { username: '', id: -1 } })
  }
})

const editMode = ref(false)
const tempImage = ref()
const { auth } = useAuthStore()
const username = computed(() => (auth.id === props.user.id ? auth.username : props.user.username))
const image = computed(() => (auth.id === props.user.id ? auth.img : props.user.image))

const toggleEditMode = () => {
  editMode.value = !editMode.value
}
const onEditComplete = () => {
  editMode.value = false
}
const onNewImage = (data: string) => {
  tempImage.value = data
}
const onCancel = () => {
  editMode.value = false
  tempImage.value = undefined
}
</script>

<template>
  <AppCard>
    <template v-slot:header>
      <ProfileImage
        class="rounded-circle shadow-sm"
        width="200"
        height="200"
        :src="tempImage || '/profile.png'"
        :alt="user.username + ' profile'"
      />
    </template>
    <template v-slot:body>
      <div class="text-center">
        <template v-if="!editMode">
          <h3>{{ username }}</h3>
          <AppButton v-if="auth.id === user.id" @click="toggleEditMode">{{ $t('edit') }}</AppButton>
          <div class="mt-3"></div>
          <DeleteUserButton :id="user.id" />
        </template>
        <EditUserForm v-else @cancel="onCancel" @save="onEditComplete" @newImg="onNewImage" />
      </div>
    </template>
  </AppCard>
</template>
