import axios from 'axios'
import store from '../store'
import router from '../router'

// Базовый URL для всех запросов
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

// Отключаем withCredentials для предотвращения OPTIONS запросов CORS
axios.defaults.withCredentials = false

// Логирование запросов для отладки
axios.interceptors.request.use(
  config => {
    console.log('Отправка запроса:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      headers: config.headers,
      data: config.data
    });
    
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
  response => {
    console.log('Получен ответ:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    // Логирование ошибок
    console.error('Ошибка запроса:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
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
    
    // Обработка ошибки CORS 405 Method Not Allowed
    if (error.response && error.response.status === 405) {
      console.error('Ошибка CORS: метод не разрешен (405). Бэкенд не поддерживает предварительные OPTIONS запросы.');
    }
    
    // Отдельно обрабатываем случай, когда API возвращает редирект
    if (error.response && error.response.status === 307) {
      console.warn('Получен редирект (307). URL запроса:', error.config.url)
      console.warn('Редирект на:', error.response.headers.location)
      // Пробуем выполнить запрос по новому URL
      const redirectUrl = error.response.headers.location
      if (redirectUrl) {
        console.log('Автоматический переход по редиректу на:', redirectUrl)
        return axios(error.config)
      }
    }
    
    return Promise.reject(error)
  }
)

export default axios 