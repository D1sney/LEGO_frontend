<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Регистрация</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            type="text" 
            id="username" 
            v-model="userData.username" 
            required
            autocomplete="username"
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
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </div>
      </form>
      
      <div class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войдите</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RegisterView',
  data() {
    return {
      userData: {
        username: '',
        email: '',
        password: ''
      },
      registrationSuccess: false
    };
  },
  computed: {
    ...mapGetters({
      loading: 'isLoading',
      error: 'getError'
    })
  },
  methods: {
    async register() {
      try {
        // Очищаем предыдущие ошибки
        this.$store.commit('SET_ERROR', null);
        
        // Базовая валидация
        if (!this.userData.username || !this.userData.username.trim()) {
          this.$store.commit('SET_ERROR', 'Имя пользователя не может быть пустым');
          return;
        }
        
        if (!this.userData.email || !this.validateEmail(this.userData.email)) {
          this.$store.commit('SET_ERROR', 'Введите корректный email');
          return;
        }
        
        if (!this.userData.password || this.userData.password.length < 6) {
          this.$store.commit('SET_ERROR', 'Пароль должен содержать не менее 6 символов');
          return;
        }
        
        console.log('Отправка формы регистрации. Данные:', {
          username: this.userData.username,
          email: this.userData.email,
          password: '********' // Не логируем реальный пароль
        });
        
        try {
          // Сначала пробуем отправить через Vuex/axios
          await this.$store.dispatch('register', this.userData);
        } catch (axiosError) {
          // Если получаем ошибку CORS (405), пробуем использовать прямой fetch запрос
          if (axiosError.response && axiosError.response.status === 405) {
            console.log('Получена ошибка 405, пробуем использовать прямой fetch запрос');
            const result = await this.registerWithFetch();
            if (!result.success) {
              throw new Error(result.message);
            }
          } else {
            // Если это другая ошибка, пробрасываем её дальше
            throw axiosError;
          }
        }
        
        this.registrationSuccess = true;
        console.log('Регистрация успешна, выполняем автоматический вход');
        
        // Автоматически выполняем вход после успешной регистрации
        const formData = new URLSearchParams();
        formData.append('username', this.userData.email);  // Используем email для логина
        formData.append('password', this.userData.password);
        
        console.log('Данные для автологина после регистрации:', {
          username: this.userData.email, // Используется email как username при логине
          password: '********'
        });
        
        await this.$store.dispatch('login', formData);
        await this.$store.dispatch('fetchCurrentUser');
        
        // Перенаправляем на главную страницу
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        // Обработка ошибки происходит в хранилище
      }
    },
    
    // Альтернативный метод регистрации без использования axios
    async registerWithFetch() {
      try {
        this.$store.commit('SET_LOADING', true);
        
        const response = await fetch('http://localhost:8000/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(this.userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          const errorMessage = data.detail || 'Ошибка регистрации';
          this.$store.commit('SET_ERROR', errorMessage);
          return { success: false, message: errorMessage };
        }
        
        return { success: true, data };
      } catch (error) {
        console.error('Ошибка при выполнении fetch запроса:', error);
        this.$store.commit('SET_ERROR', 'Не удалось подключиться к серверу');
        return { success: false, message: 'Не удалось подключиться к серверу' };
      } finally {
        this.$store.commit('SET_LOADING', false);
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