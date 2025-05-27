<template>
  <div class="register-container">
    <!-- Форма регистрации -->
    <div v-if="!showVerification" class="register-card">
      <h1>Регистрация</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="requestEmailVerification">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            type="text" 
            id="username" 
            v-model="userData.username" 
            required
            autocomplete="username"
            minlength="3"
            maxlength="50"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="userData.email" 
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="userData.password" 
            required
            autocomplete="new-password"
            minlength="8"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Отправка кода...' : 'Продолжить' }}
          </button>
        </div>
      </form>
      
      <div class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войдите</router-link>
      </div>
    </div>
    
    <!-- Форма верификации email -->
    <EmailVerificationForm 
      v-if="showVerification"
      :email="userData.email"
      @verified="onEmailVerified"
      @back="showVerification = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EmailVerificationForm from '@/components/EmailVerificationForm.vue';
import axios from 'axios';

export default {
  name: 'RegisterView',
  components: {
    EmailVerificationForm
  },
  data() {
    return {
      userData: {
        username: '',
        email: '',
        password: ''
      },
      showVerification: false,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapGetters({
      storeLoading: 'isLoading',
      storeError: 'getError'
    })
  },
  methods: {
    async requestEmailVerification() {
      // Очищаем предыдущие ошибки
      this.error = null;
      
      // Базовая валидация
      if (!this.userData.username || this.userData.username.trim().length < 3) {
        this.error = 'Имя пользователя должно содержать не менее 3 символов';
        return;
      }
      
      if (!this.userData.email || !this.validateEmail(this.userData.email)) {
        this.error = 'Введите корректный email';
        return;
      }
      
      if (!this.userData.password || this.userData.password.length < 8) {
        this.error = 'Пароль должен содержать не менее 8 символов';
        return;
      }
      
      this.loading = true;
      
      try {
        console.log('Отправка запроса на верификацию email:', {
          username: this.userData.username,
          email: this.userData.email,
          password: '********' // Не логируем реальный пароль
        });
        
        // Отправляем запрос на верификацию email
        await axios.post('/users/request-email-verification', this.userData);
        
        // Переходим к форме верификации
        this.showVerification = true;
        
      } catch (error) {
        console.error('Ошибка при запросе верификации email:', error);
        
        if (error.response?.data?.detail) {
          this.error = error.response.data.detail;
        } else {
          this.error = 'Ошибка при отправке кода подтверждения. Попробуйте еще раз.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async onEmailVerified(userData) {
      try {
        console.log('Email успешно подтвержден, выполняем автоматический вход');
        
        // Автоматически выполняем вход после успешной регистрации
        const formData = new URLSearchParams();
        formData.append('username', this.userData.email);  // Используем email для логина
        formData.append('password', this.userData.password);
        
        await this.$store.dispatch('login', formData);
        await this.$store.dispatch('fetchCurrentUser');
        
        // Перенаправляем на главную страницу
        this.$router.push('/');
        
      } catch (error) {
        console.error('Ошибка при автоматическом входе:', error);
        // Если автоматический вход не удался, перенаправляем на страницу входа
        this.$router.push('/login');
      }
    },
    
    // Простая валидация email
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.register-card {
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

.login-link {
  margin-top: 20px;
  text-align: center;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 