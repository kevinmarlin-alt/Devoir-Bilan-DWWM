import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue';
import DashboardTemplate from '@/templates/DashboardTemplate.vue';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/admin',
      component: DashboardTemplate,
      children: [
        {
          path: 'home',
          name: 'dashboard_home',
          component: HomeView
        }
      ]
    }
  ],
})

export default router
