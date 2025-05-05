import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/main.scss'
import './api/axios' // Импортируем настройки axios
import authService from './services/auth-service'
import axios from 'axios'

// Создаем экземпляр приложения
const app = createApp(App)

// Логирование всех запросов для отладки
if (process.env.NODE_ENV !== 'production') {
  axios.interceptors.request.use(config => {
    console.log(`[REQUEST] ${config.method.toUpperCase()} ${config.url}`, config.params || {});
    return config;
  });
  
  axios.interceptors.response.use(response => {
    console.log(`[RESPONSE] ${response.status} ${response.config.url}`, {
      data: response.data instanceof Object ? response.data : '[Data]'
    });
    return response;
  }, error => {
    console.error(`[RESPONSE ERROR] ${error.config?.url || 'unknown url'}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  });
}

// Настройка глобальной обработки ошибок для Vue
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Global Error:', err, info)
  
  // Если ошибка связана с авторизацией, обрабатываем ее
  if (err.response && (err.response.status === 401 || err.response.status === 403)) {
    store.commit('LOGOUT')
    router.push('/login')
  }
}

// Проверяем наличие токена при загрузке
const token = localStorage.getItem('auth_token')
if (token) {
  console.log('Обнаружен токен в localStorage при запуске приложения')
  // Устанавливаем токен для всех запросов axios
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // Устанавливаем токен в хранилище
  store.commit('SET_AUTH_TOKEN', token)
}

// Инициализируем сервис аутентификации перед запуском приложения
console.log('Инициализация сервиса аутентификации...')
authService.initialize().finally(() => {
  console.log('Аутентификация инициализирована. Состояние:', store.getters.isAuthenticated)
  
  // Регистрация хранилища и маршрутизатора
  app.use(store).use(router).mount('#app')
}) 