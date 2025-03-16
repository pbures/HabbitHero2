import { useAuth0 } from '@auth0/auth0-vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/EditView.vue'),
      // meta: {
      //   requiresAuth: true,
      // },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('../views/FriendsView.vue'),
    },
    {
      path: '/userprofile',
      name: 'userprofile',
      component: () => import('../views/UserProfileEdit.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      loginWithRedirect()
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
