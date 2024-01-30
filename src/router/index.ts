import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '@/views/sign-up/SignUp.vue';
import AppHome from '@/views/home/AppHome.vue';
import AppActivation from '@/views/activation/AppActivation.vue';

const router = createRouter( {
  history: createWebHistory( import.meta.env.BASE_URL ),
  routes: [
    {
      path: '/',
      component: AppHome
    },
    {
      path: '/signup',
      component: SignUp
    },
    {
      path: '/activation/:token',
      component: AppActivation
    }
  ]
} );

export default router;
