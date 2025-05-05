<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Вход в систему</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            type="text" 
            id="username" 
            v-model="credentials.username" 
            required
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password" 
            required
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Выполняется вход...' : 'Войти' }}
          </button>
        </div>
      </form>
      
      <div class="register-link">
        Нет аккаунта? <router-link to="/register">Зарегистрируйтесь</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'LoginView',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      }
    };
  },
  computed: {
    ...mapGetters({
      loading: 'isLoading',
      error: 'getError'
    })
  },
  methods: {
    async login() {
      try {
        // Преобразуем данные формы в формат x-www-form-urlencoded для запроса
        const formData = new URLSearchParams();
        formData.append('username', this.credentials.username);
        formData.append('password', this.credentials.password);
        
        await this.$store.dispatch('login', formData);
        
        // После успешной авторизации получаем информацию о пользователе
        await this.$store.dispatch('fetchCurrentUser');
        
        // Перенаправляем на главную страницу
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка входа:', error);
      }
    }
  },
  // При входе на страницу проверяем авторизацию
  beforeMount() {
    // Если пользователь уже авторизован, перенаправляем на главную
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h1 {
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-actions {
  margin-top: 30px;
}

.btn {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.register-link {
  margin-top: 20px;
  text-align: center;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 