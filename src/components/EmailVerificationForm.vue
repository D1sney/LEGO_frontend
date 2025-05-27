<template>
  <div class="email-verification-container">
    <div class="verification-card">
      <h2>Подтверждение email</h2>
      
      <div class="verification-info">
        <p>Мы отправили код подтверждения на адрес:</p>
        <strong>{{ email }}</strong>
        <p class="info-text">Введите 6-значный код из письма</p>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="verifyCode">
        <div class="form-group">
          <label for="verification-code">Код подтверждения</label>
          <input 
            type="text" 
            id="verification-code"
            v-model="verificationCode" 
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="000000"
            class="verification-input"
            required
            @input="formatCode"
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="loading || verificationCode.length !== 6"
          >
            {{ loading ? 'Проверка...' : 'Подтвердить' }}
          </button>
        </div>
      </form>
      
      <div class="resend-section">
        <button 
          v-if="canResend"
          @click="resendCode" 
          class="btn btn-secondary"
          :disabled="resendLoading"
        >
          {{ resendLoading ? 'Отправка...' : 'Отправить код повторно' }}
        </button>
        
        <div v-else class="resend-timer">
          Повторная отправка будет доступна через {{ formatTime(timeLeft) }}
        </div>
      </div>
      
      <div class="back-link">
        <button @click="$emit('back')" class="btn btn-link">
          ← Вернуться к регистрации
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmailVerificationForm',
  props: {
    email: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      verificationCode: '',
      loading: false,
      resendLoading: false,
      error: null,
      successMessage: null,
      timeLeft: 120, // 2 минуты в секундах
      timer: null
    };
  },
  computed: {
    canResend() {
      return this.timeLeft <= 0;
    }
  },
  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    formatCode(event) {
      // Оставляем только цифры
      this.verificationCode = event.target.value.replace(/\D/g, '');
    },
    
    async verifyCode() {
      if (this.verificationCode.length !== 6) {
        this.error = 'Код должен содержать 6 цифр';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        // Сначала проверяем код
        await axios.post('/users/verify-email-code', {
          email: this.email,
          code: this.verificationCode
        });
        
        // Если код верный, завершаем регистрацию
        const response = await axios.post('/users/register', {
          email: this.email,
          code: this.verificationCode
        });
        
        this.successMessage = 'Email успешно подтвержден! Выполняется вход в систему...';
        
        // Эмитируем событие успешной верификации с данными пользователя
        this.$emit('verified', response.data);
        
      } catch (error) {
        console.error('Ошибка верификации:', error);
        
        if (error.response?.data?.detail) {
          this.error = error.response.data.detail;
        } else {
          this.error = 'Ошибка при подтверждении кода. Попробуйте еще раз.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async resendCode() {
      if (!this.canResend) return;
      
      this.resendLoading = true;
      this.error = null;
      this.successMessage = null;
      
      try {
        await axios.post('/users/resend-verification-code', {
          email: this.email
        });
        
        this.successMessage = 'Код отправлен повторно!';
        this.timeLeft = 120; // Сбрасываем таймер
        this.startTimer();
        
        // Очищаем сообщение об успехе через 3 секунды
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
        
      } catch (error) {
        console.error('Ошибка повторной отправки:', error);
        
        if (error.response?.data?.detail) {
          this.error = error.response.data.detail;
        } else {
          this.error = 'Ошибка при повторной отправке кода. Попробуйте позже.';
        }
      } finally {
        this.resendLoading = false;
      }
    },
    
    startTimer() {
      this.stopTimer(); // Останавливаем предыдущий таймер, если есть
      
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.stopTimer();
        }
      }, 1000);
    },
    
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.email-verification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.verification-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
}

h2 {
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.verification-info {
  text-align: center;
  margin-bottom: 24px;
  
  p {
    margin-bottom: 8px;
    color: #666;
  }
  
  strong {
    color: #333;
    font-size: 1.1em;
  }
  
  .info-text {
    font-size: 0.9em;
    color: #888;
    margin-top: 12px;
  }
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.verification-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  text-align: center;
  letter-spacing: 0.5em;
  font-family: monospace;
  
  &:focus {
    border-color: #4CAF50;
    outline: none;
  }
}

.form-actions {
  margin-bottom: 24px;
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
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
}

.btn-link {
  background: none;
  color: #4CAF50;
  text-decoration: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.resend-section {
  text-align: center;
  margin-bottom: 20px;
}

.resend-timer {
  color: #666;
  font-size: 0.9em;
  padding: 8px;
}

.back-link {
  text-align: center;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}
</style> 