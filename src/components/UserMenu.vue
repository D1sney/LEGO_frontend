<template>
  <div class="user-menu">
    <template v-if="isAuthenticated">
      <div class="user-info">
        <span class="username">{{ user ? user.username : 'Пользователь' }}</span>
        <button class="logout-btn" @click="logout" title="Выйти">
          <i class="fas fa-sign-out-alt"></i> Выйти
        </button>
      </div>
    </template>
    <template v-else>
      <div class="auth-buttons">
        <router-link to="/login" class="btn btn-login">Войти</router-link>
        <router-link to="/register" class="btn btn-register">Регистрация</router-link>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'UserMenu',
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      user: 'getUser'
    })
  },
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('logout');
        // Перенаправляем на страницу входа после выхода
        this.$router.push('/login');
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    }
  }
};
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 500;
  margin-right: 10px;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-login {
  background-color: transparent;
  border: 1px solid #fff;
  color: #fff;
}

.btn-login:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-register {
  background-color: #4CAF50;
  color: white;
  border: 1px solid #4CAF50;
}

.btn-register:hover {
  background-color: #45a049;
}
</style> 