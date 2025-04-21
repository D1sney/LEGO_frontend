import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/sets/:id',
    name: 'set-details',
    // Lazy-loaded компонент
    component: () => import(/* webpackChunkName: "set-details" */ '../views/SetDetailsView.vue')
  },
  {
    path: '/minifigures/:id',
    name: 'minifigure-details',
    // Lazy-loaded компонент
    component: () => import(/* webpackChunkName: "minifigure-details" */ '../views/MinifigureDetailsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 