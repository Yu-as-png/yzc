import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/login', name: 'login', component: () => import('./views/Login.vue'), meta: { public: true } },
  { path: '/', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/publish', name: 'publish', component: () => import('./views/Publish.vue') },
  { path: '/headlines/:id', name: 'detail', component: () => import('./views/Detail.vue') },
  { path: '/mine', name: 'mine', component: () => import('./views/Mine.vue') },
  { path: '/profile', name: 'profile', component: () => import('./views/Profile.vue') },
  { path: '/admin', name: 'admin', component: () => import('./views/Admin.vue'), meta: { admin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (!to.meta.public && !token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && token) return { name: 'home' };
});

export default router;
