import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/main.scss'
import './api/axios' // Импортируем настройки axios
import authService from './services/auth-service'

// Инициализация приложения
const app = createApp(App)

// Настройка глобальной обработки ошибок для Vue
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Global Error:', err, info)
  
  // Если ошибка связана с авторизацией, обрабатываем ее
  if (err.response && (err.response.status === 401 || err.response.status === 403)) {
    store.commit('LOGOUT')
    router.push('/login')
  }
}

// Инициализируем сервис аутентификации перед запуском приложения
authService.initialize().finally(() => {
  // Регистрация хранилища и маршрутизатора
  app.use(store).use(router).mount('#app')
}) 