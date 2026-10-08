import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue';
import DashboardTemplate from '@/templates/DashboardTemplate.vue';
import HomeView from '@/views/HomeView.vue';
import { getAuthenticatedUser } from '@/services/auth.service';

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
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home',
          name: 'dashboard_home',
          component: HomeView
        }
      ]
    }
  ],
});

router.beforeEach(async (to) => {
  const user = await getAuthenticatedUser();

  if (to.meta.requiresAuth && !user) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
})

export default router
