import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    sets: [],
    minifigures: [],
    currentSet: null,
    currentMinifigure: null,
    tags: [],
    loading: false,
    error: null,
    apiBaseUrl: '/api'
  },
  getters: {
    getSets: state => state.sets,
    getMinifigures: state => state.minifigures,
    getCurrentSet: state => state.currentSet,
    getCurrentMinifigure: state => state.currentMinifigure,
    getTags: state => state.tags,
    isLoading: state => state.loading,
    getError: state => state.error
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
    }
  },
  actions: {
    async fetchSets({ commit, state }, { limit = 10, offset = 0, search = '' } = {}) {
      try {
        commit('SET_LOADING', true);
        
        const response = await axios.get(`${state.apiBaseUrl}/sets/?limit=${limit}&offset=${offset}&search=${search}`);
        commit('SET_SETS', response.data);
        
        return response.data;
      } catch (error) {
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
        commit('SET_ERROR', error.message || 'Ошибка при загрузке тегов');
        console.error('Error fetching tags:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
}) 