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
    apiBaseUrl: '/api',
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
    getUser: state => state.auth.user
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
        
        const response = await axios.post(`${this.state.apiBaseUrl}/users/login`, credentials, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const token = response.data.access_token;
        commit('SET_AUTH_TOKEN', token);
        
        // Устанавливаем токен для всех будущих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Ошибка аутентификации');
        console.error('Authentication error:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Регистрация нового пользователя
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.post(`${this.state.apiBaseUrl}/users/register`, userData);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Ошибка регистрации');
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
        
        const response = await axios.get(`${this.state.apiBaseUrl}/users/me`);
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
    
    async fetchSets({ commit, state }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/sets/?limit=${limit}&offset=${offset}&search=${search}`);
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
    
    async fetchMinifigures({ commit, state }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/minifigures/?limit=${limit}&offset=${offset}&search=${search}`);
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
    
    async fetchSetById({ commit, state }, id) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/sets/${id}`);
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
    
    async fetchMinifigureById({ commit, state }, id) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/minifigures/${id}/`);
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
    
    async fetchTags({ commit, state }) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/tags/`);
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