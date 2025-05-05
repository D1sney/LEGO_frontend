import axios from 'axios'
import store from '../store'
import router from '../router'

// Базовый URL для всех запросов
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

// Добавляем токен к каждому запросу, если он есть
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Глобальная обработка ответов
axios.interceptors.response.use(
  response => response,
  error => {
    // Обрабатываем ошибки авторизации (401) и доступа (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Ошибка авторизации:', error.response.status)
      
      // Удаляем невалидный токен
      store.commit('LOGOUT')
      
      // Перенаправляем на страницу входа
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login' && currentPath !== '/register') {
        router.push('/login')
      }
    }
    
    return Promise.reject(error)
  }
)

export default axios 