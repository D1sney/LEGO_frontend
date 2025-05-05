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
        console.log('Устанавливаем токен авторизации для будущих запросов:', token ? 'токен установлен' : 'токен отсутствует');
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
        
        // Проверяем наличие токена авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('Попытка запроса наборов без токена авторизации. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
        }
        
        // Формирование URL с параметрами запроса и без завершающего слеша
        const url = `/sets?limit=${limit}&offset=${offset}&search=${search}`;
        console.log(`Запрос списка наборов по URL: ${url}`);
        
        // Явно указываем заголовок Authorization
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log(`Успешно получен список наборов. Количество: ${response.data.length || 0}`);
        commit('SET_SETS', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке наборов:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url
        });
        
        // Если получили ошибку 405, пробуем с завершающим слешем
        if (error.response && error.response.status === 405) {
          console.error('Ошибка 405 Method Not Allowed. Пробуем альтернативный URL со слешем...');
          
          try {
            const altUrl = `/sets/?limit=${limit}&offset=${offset}&search=${search}`;
            console.log(`Пробуем альтернативный URL: ${altUrl}`);
            
            const retryResponse = await axios.get(altUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            console.log(`Успешно получен список наборов через альтернативный URL. Количество: ${retryResponse.data.length || 0}`);
            commit('SET_SETS', retryResponse.data);
            return retryResponse.data;
          } catch (retryError) {
            console.error('Ошибка при использовании альтернативного URL:', {
              status: retryError.response?.status,
              statusText: retryError.response?.statusText
            });
          }
        }
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        
        commit('SET_ERROR', error.response?.data?.detail || error.message || 'Ошибка при загрузке наборов');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchMinifigures({ commit }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        // Проверяем наличие токена авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('Попытка запроса минифигурок без токена авторизации. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
        }
        
        // Явно указываем заголовок Authorization
        const response = await axios.get(`/minifigures/?limit=${limit}&offset=${offset}&search=${search}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        commit('SET_MINIFIGURES', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке минифигурок:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        
        commit('SET_ERROR', error.response?.data?.detail || error.message || 'Ошибка при загрузке минифигурок');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchSetById({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        
        // Проверяем наличие токена авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('Попытка запроса набора без токена авторизации. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
        }
        
        // Изменение формата URL согласно документации API
        const url = `/sets/${id}`;  // Убираем завершающий слеш
        console.log(`Запрос набора с ID: ${id} по URL: ${url}, токен авторизации: ${token ? 'присутствует' : 'отсутствует'}`);
        
        // Проверяем, установлен ли заголовок Authorization
        const authHeader = axios.defaults.headers.common['Authorization'];
        if (!authHeader) {
          console.log('Заголовок Authorization не установлен. Устанавливаем...');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Отправляем запрос с явным указанием заголовка авторизации
        // Теперь используем точный URL без слешей на конце
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        commit('SET_CURRENT_SET', response.data);
        console.log(`Успешно получены данные набора #${id}:`, response.data);
        
        return response.data;
      } catch (error) {
        console.error(`Ошибка при загрузке набора #${id}:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            baseURL: error.config.baseURL
          } : 'Конфигурация недоступна'
        });
        
        // Если получили ошибку 405, пробуем другие варианты URL
        if (error.response && error.response.status === 405) {
          console.error('Ошибка 405 Method Not Allowed. Пробуем альтернативные форматы URL...');
          
          // Массив возможных форматов URL для тестирования
          const urlFormats = [
            `/sets/${id}/`, // с завершающим слешем
            `/sets/${id}`,  // без завершающего слеша
            `/sets/${id}?`, // с параметром запроса
            `/sets/${id}?format=json` // с параметром формата
          ];
          
          // Пробуем поочередно все форматы URL
          let success = false;
          for (const testUrl of urlFormats) {
            // Пропускаем текущий URL, если он уже был проверен
            if (testUrl === url) continue;
            
            try {
              console.log(`Пробуем альтернативный URL: ${testUrl}`);
              const retryResponse = await axios.get(testUrl, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json'
                }
              });
              
              if (retryResponse.status === 200) {
                commit('SET_CURRENT_SET', retryResponse.data);
                console.log(`Успешно получены данные через альтернативный URL: ${testUrl}`);
                success = true;
                return retryResponse.data;
              }
            } catch (retryError) {
              console.error(`Ошибка при использовании URL ${testUrl}:`, {
                status: retryError.response?.status,
                statusText: retryError.response?.statusText
              });
            }
          }
          
          if (!success) {
            console.error('Все попытки альтернативных URL завершились неудачей');
          }
        }
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Ошибка авторизации при запросе набора. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
        }
        
        commit('SET_ERROR', error.response?.data?.detail || error.message || `Ошибка при загрузке набора #${id}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchMinifigureById({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        
        // Проверяем наличие токена авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('Попытка запроса минифигурки без токена авторизации. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
        }
        
        // Записываем URL и логируем для сравнения с запросом набора
        const url = `/minifigures/${id}/`;
        console.log(`Запрос минифигурки с ID: ${id} по URL: ${url}, токен авторизации: ${token ? 'присутствует' : 'отсутствует'}`);
        
        // Проверяем, установлен ли заголовок Authorization
        const authHeader = axios.defaults.headers.common['Authorization'];
        if (!authHeader) {
          console.log('Заголовок Authorization не установлен. Устанавливаем...');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Отправляем запрос с явным указанием заголовка авторизации
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log(`Успешно получена минифигурка #${id}. URL, который сработал: ${url}`);
        console.log('Заголовки запроса минифигурки:', {
          Authorization: `Bearer ${token.substring(0, 10)}...`,
          Accept: 'application/json'
        });
        
        commit('SET_CURRENT_MINIFIGURE', response.data);
        
        return response.data;
      } catch (error) {
        console.error(`Ошибка при загрузке минифигурки #${id}:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            baseURL: error.config.baseURL
          } : 'Конфигурация недоступна'
        });
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            console.warn('Ошибка авторизации при запросе минифигурки. Перенаправление на страницу входа.');
            commit('LOGOUT');
            router.push('/login');
          } else if (error.response.status === 405) {
            console.error('Ошибка 405 Method Not Allowed при запросе минифигурки. Возможно проблема с CORS или авторизацией.');
          }
        }
        
        commit('SET_ERROR', error.response?.data?.detail || error.message || `Ошибка при загрузке минифигурки #${id}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchTags({ commit }) {
      try {
        commit('SET_LOADING', true);
        
        // Проверяем наличие токена авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('Попытка запроса тегов без токена авторизации. Перенаправление на страницу входа.');
          commit('LOGOUT');
          router.push('/login');
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
        }
        
        // Явно указываем заголовок Authorization
        const response = await axios.get('/tags/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        commit('SET_TAGS', response.data);
        
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке тегов:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          commit('LOGOUT');
          router.push('/login');
        }
        
        commit('SET_ERROR', error.response?.data?.detail || error.message || 'Ошибка при загрузке тегов');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
})