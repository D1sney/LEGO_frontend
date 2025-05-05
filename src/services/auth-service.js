import store from '../store'
import axios from 'axios'

class AuthService {
  /**
   * Инициализирует состояние авторизации при загрузке приложения
   */
  async initialize() {
    // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      console.log('Найден токен в localStorage, проверяем валидность...')
      
      // Устанавливаем токен для всех запросов axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Устанавливаем токен в состояние приложения
      store.commit('SET_AUTH_TOKEN', token)
      
      // Пытаемся получить информацию о пользователе
      try {
        console.log('Запрос информации о пользователе с токеном...')
        await store.dispatch('fetchCurrentUser')
        console.log('Токен валидный, пользователь авторизован')
        return true
      } catch (error) {
        console.warn('Ошибка при инициализации состояния авторизации:', error)
        // Если токен недействителен, выполняем выход
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Токен недействителен, выполняем выход')
          store.commit('LOGOUT')
          delete axios.defaults.headers.common['Authorization']
        }
        return false
      }
    }
    
    console.log('Токен не найден, пользователь не авторизован')
    return false
  }
}

export default new AuthService() 