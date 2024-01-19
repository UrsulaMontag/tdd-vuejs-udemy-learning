import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '@/views/sign-up/SignUp.vue';

const router = createRouter( {
  history: createWebHistory( import.meta.env.BASE_URL ),
  routes: [
    {
      path: '/',
      component: SignUp
    },
    {
      path: '/signup',
      component: SignUp
    },
  ]
} );

export default router;
