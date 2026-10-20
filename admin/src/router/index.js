import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import HomeView from '@/views/HomeView.vue';
import { getAuthenticatedUser } from '@/services/auth.service';
import CategoriesHomeView from '@/views/categories/CategoriesHomeView.vue';
import CategoriesCreateView from '@/views/categories/CategoriesCreateView.vue';
import CategoriesUpdateView from '@/views/categories/CategoriesUpdateView.vue';
import ExploitationTypesLayout from '@/layouts/ExploitationTypesLayout.vue';
import ExploitationTypesHomeView from '@/views/exploitationTypes/ExploitationTypesHomeView.vue';
import ExploitationTypeCreateView from '@/views/exploitationTypes/ExploitationTypeCreateView.vue';

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
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home',
          name: 'dashboard_home',
          component: HomeView
        },
        {
          path: 'categories',
          name: 'categories-home',
          component: CategoriesHomeView
        },
        {
          path: 'categories/add',
          name: 'categories-create',
          component: CategoriesCreateView
        },
        {
          path: 'categories/:categoryId',
          name: 'categories-update',
          component: CategoriesUpdateView
        },
        {
          path: 'exploitation-types',
          component: ExploitationTypesLayout,
          children: [
            {
              path: '',
              name: 'exploitation-types_home',
              component: ExploitationTypesHomeView
            },
            {
              path: 'add',
              name: 'exploitation-types_create',
              component: ExploitationTypeCreateView
            }
          ]
        }

      ]
    }
  ],
});

router.beforeEach(async (to) => {
  if(!to.meta.requiresAuth) {
    return
  }
  
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
})

export default router
