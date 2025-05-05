import { createStore } from 'vuex'
import axios from 'axios'
import router from '../router'

export default createStore({
  state: {
    sets: [],
    minifigures: [],
    currentSet: null,
    currentMinifigure: null,
    tags: [],
    loading: false,
    error: null,
    auth: {
      token: localStorage.getItem('auth_token') || null,
      user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
      isAuthenticated: !!localStorage.getItem('auth_token')
    }
  },
  getters: {
    getSets: state => state.sets,
    getMinifigures: state => state.minifigures,
    getCurrentSet: state => state.currentSet,
    getCurrentMinifigure: state => state.currentMinifigure,
    getTags: state => state.tags,
    isLoading: state => state.loading,
    getError: state => state.error,
    isAuthenticated: state => state.auth.isAuthenticated,
    getToken: state => state.auth.token,
    getUser: state => state.auth.user,
    isAdmin: state => state.auth.user && state.auth.user.role === 'admin'
  },
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_SETS(state, sets) {
      state.sets = sets;
    },
    SET_MINIFIGURES(state, minifigures) {
      state.minifigures = minifigures;
    },
    SET_CURRENT_SET(state, set) {
      state.currentSet = set;
    },
    SET_CURRENT_MINIFIGURE(state, minifigure) {
      state.currentMinifigure = minifigure;
    },
    SET_TAGS(state, tags) {
      state.tags = tags;
    },
    SET_AUTH_TOKEN(state, token) {
      state.auth.token = token;
      state.auth.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    },
    SET_USER(state, user) {
      state.auth.user = user;
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        // Если пользователь администратор, логируем это
        if (user.role === 'admin') {
          console.log('Пользователь является администратором');
        }
      } else {
        localStorage.removeItem('auth_user');
      }
    },
    LOGOUT(state) {
      state.auth.token = null;
      state.auth.user = null;
      state.auth.isAuthenticated = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },
  actions: {
    // Аутентификация пользователя
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        
        console.log('Попытка входа в систему...');
        
        // Проверяем, переданы ли данные в виде URLSearchParams
        const formData = credentials instanceof URLSearchParams 
          ? credentials 
          : new URLSearchParams({
              username: credentials.username,
              password: credentials.password
            });
        
        // Логирование данных для отладки (без пароля)
        console.log('Данные авторизации:', {
          username: formData.get('username'),
          password: '********' // Не логируем реальный пароль
        });
        
        const response = await axios.post('/users/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log('Успешный вход в систему, получен токен');
        
        const token = response.data.access_token;
        commit('SET_AUTH_TOKEN', token);
        
        // Устанавливаем токен для всех будущих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response.data;
      } catch (error) {
        console.error('Ошибка входа:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        let errorMessage = 'Ошибка аутентификации';
        
        if (error.response) {
          if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
            
            // Специальная обработка для неверных учетных данных
            if (error.response.status === 401) {
              errorMessage = 'Неверный email или пароль';
              console.warn('Ошибка 401: Неверные учетные данные при логине');
            }
          } else if (error.response.status === 401) {
            errorMessage = 'Неверный email или пароль';
          } else if (error.response.status === 404) {
            errorMessage = 'Сервер не найден. Проверьте настройки API';
          } else {
            errorMessage = `Ошибка сервера: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету';
        }
        
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Регистрация нового пользователя
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        
        console.log('Отправка данных для регистрации:', userData);
        
        // Создаем запрос с настройками для решения проблемы CORS
        const response = await axios.post('/users/register', userData, {
          headers: { 
            'Content-Type': 'application/json',
            // Убираем заголовки, которые могут вызвать предварительный OPTIONS запрос
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        console.log('Успешная регистрация, ответ сервера:', response.data);
        return response.data;
      } catch (error) {
        console.error('Детали ошибки регистрации:', {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        // Обработка различных типов ошибок
        let errorMessage = 'Ошибка регистрации';
        
        if (error.response) {
          // Ошибка от сервера с кодом статуса
          if (error.response.status === 405) {
            errorMessage = 'Проблема с методом запроса. Попробуйте другой способ регистрации или обратитесь к администратору.';
            console.error('Ошибка CORS: метод OPTIONS не разрешен на сервере. Требуется настройка сервера.');
          } else if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.status === 409) {
            errorMessage = 'Пользователь с таким именем или email уже существует';
          } else if (error.response.status === 404) {
            errorMessage = 'Сервер не найден. Проверьте адрес API';
          } else {
            errorMessage = `Ошибка сервера: ${error.response.status}`;
          }
        } else if (error.request) {
          // Запрос был отправлен, но ответ не получен
          errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету';
        }
        
        commit('SET_ERROR', errorMessage);
        console.error('Registration error:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Получить информацию о текущем пользователе
    async fetchCurrentUser({ commit }) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get('/users/me');
        
        // Логируем полученные данные
        console.log('Получена информация о пользователе:', response.data);
        
        // Проверяем наличие поля role
        if (response.data && !response.data.role) {
          console.warn('Внимание: в данных пользователя отсутствует поле role');
        }
        
        // Проверяем, является ли пользователь администратором
        const isAdmin = response.data && response.data.role === 'admin';
        if (isAdmin) {
          console.log('Пользователь определен как администратор');
        }
        
        commit('SET_USER', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
        }
        commit('SET_ERROR', error.response?.data?.detail || 'Ошибка получения данных пользователя');
        console.error('Error fetching user data:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Выход пользователя
    logout({ commit }) {
      commit('LOGOUT');
      // Удаляем токен из headers для всех будущих запросов
      delete axios.defaults.headers.common['Authorization'];
    },
    
    async fetchSets({ commit }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`/sets/?limit=${limit}&offset=${offset}&search=${search}`);
        commit('SET_SETS', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        commit('SET_ERROR', error.message || 'Ошибка при загрузке наборов');
        console.error('Error fetching sets:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchMinifigures({ commit }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`/minifigures/?limit=${limit}&offset=${offset}&search=${search}`);
        commit('SET_MINIFIGURES', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        commit('SET_ERROR', error.message || 'Ошибка при загрузке минифигурок');
        console.error('Error fetching minifigures:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchSetById({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`/sets/${id}/`);
        commit('SET_CURRENT_SET', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        commit('SET_ERROR', error.message || `Ошибка при загрузке набора #${id}`);
        console.error(`Error fetching set #${id}:`, error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchMinifigureById({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`/minifigures/${id}/`);
        commit('SET_CURRENT_MINIFIGURE', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        commit('SET_ERROR', error.message || `Ошибка при загрузке минифигурки #${id}`);
        console.error(`Error fetching minifigure #${id}:`, error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchTags({ commit }) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get('/tags/');
        commit('SET_TAGS', response.data);
        
        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        commit('SET_ERROR', error.message || 'Ошибка при загрузке тегов');
        console.error('Error fetching tags:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
})