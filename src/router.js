import { createRouter, createWebHistory } from 'vue-router';

// Общий макет для страниц (например, с навигацией)
const Layout = () => import('@/components/Layout.vue');

// Модули
const Login = () => import('@/modules/auth/login/login.vue');
const Register = () => import('@/modules/auth/register/register.vue');
const Profile = () => import('@/modules/profile/Profile.vue');
const Characters = () => import('@/modules/characters/Characters.vue');
const Scenes = () => import('@/modules/scenes/Scenes.vue');

// Определение маршрутов
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/characters', component: Characters, meta: { requiresAuth: true } },
  { path: '/scenes', component: Scenes, meta: { requiresAuth: true } },
  { path: '/', redirect: '/login' },
  { path: '/:catchAll(.*)', redirect: '/login' }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;