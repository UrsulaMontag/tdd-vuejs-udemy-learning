import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '@/views/sign-up/SignUp.vue';
import AppHome from '@/views/home/AppHome.vue';
import AppActivation from '@/views/activation/AppActivation.vue';
import ResetRequest from '@/views/password-reset/request/ResetRequest.vue';
import ResetSet from '@/views/password-reset/set/ResetSet.vue';
import UserView from '@/views/user/UserView.vue';
import UserLogin from '@/views/login/UserLogin.vue';

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
    },
    {
      path: '/password-reset/request',
      component: ResetRequest
    },
    {
      path: '/password-reset/set',
      component: ResetSet
    },
    {
      path: '/user/:id',
      component: UserView
    },
    {
      path: '/login',
      component: UserLogin
    }
  ]
} );

export default router;
