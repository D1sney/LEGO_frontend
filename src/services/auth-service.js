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
      // Устанавливаем токен для всех запросов axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Устанавливаем токен в состояние приложения
      store.commit('SET_AUTH_TOKEN', token)
      
      // Пытаемся получить информацию о пользователе
      try {
        await store.dispatch('fetchCurrentUser')
        return true
      } catch (error) {
        console.warn('Ошибка при инициализации состояния авторизации:', error)
        // Если токен недействителен, выполняем выход
        store.commit('LOGOUT')
        return false
      }
    }
    
    return false
  }
}

export default new AuthService() 