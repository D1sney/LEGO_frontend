import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import(/* webpackChunkName: "collection" */ '../views/CollectionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sets/:id',
    name: 'set-details',
    // Lazy-loaded компонент
    component: () => import(/* webpackChunkName: "set-details" */ '../views/SetDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/minifigures/:id',
    name: 'minifigure-details',
    // Lazy-loaded компонент
    component: () => import(/* webpackChunkName: "minifigure-details" */ '../views/MinifigureDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import(/* webpackChunkName: "register" */ '../views/RegisterView.vue')
  },
  {
    path: '/tournaments',
    name: 'tournaments',
    component: () => import(/* webpackChunkName: "tournaments" */ '../views/TournamentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tournaments/create',
    name: 'tournament-create',
    component: () => import(/* webpackChunkName: "tournament-create" */ '../views/TournamentCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tournaments/:id',
    name: 'tournament-details',
    component: () => import(/* webpackChunkName: "tournament-details" */ '../views/TournamentDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  // Маршрут для перенаправления, если страница не найдена
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Навигационный охранник для проверки авторизации
router.beforeEach((to, from, next) => {
  // Проверяем, требует ли маршрут авторизации
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!store.getters.isAuthenticated) {
      next({ name: 'login' });
    } else {
      next(); // Пользователь авторизован, продолжаем навигацию
    }
  } else {
    next(); // Маршрут не требует авторизации, продолжаем навигацию
  }
});

export default router 