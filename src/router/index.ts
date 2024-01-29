import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '@/views/sign-up/SignUp.vue'
import AppHome from '@/views/home/AppHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppHome
    },
    {
      path: '/signup',
      component: SignUp
    }
  ]
})

export default router
