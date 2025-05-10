<template>
  <div class="tournament-create-form">
    <h2>Создание турнира</h2>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Название турнира</label>
        <input 
          type="text" 
          id="title" 
          v-model="form.title" 
          class="form-control" 
          required
          placeholder="Например: Лучший набор Гарри Поттера"
        />
      </div>
      
      <div class="form-group">
        <label>Тип турнира</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="sets" checked />
            <span>Наборы</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="minifigures" />
            <span>Минифигурки</span>
          </label>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Параметры фильтрации</h3>
        
        <div class="form-group">
          <label for="search">Поиск по названию</label>
          <input 
            type="text" 
            id="search" 
            v-model="form.search" 
            class="form-control" 
            placeholder="Введите часть названия"
          />
        </div>
        
        <div class="form-group">
          <label for="tag_names">Теги (через запятую)</label>
          <input 
            type="text" 
            id="tag_names" 
            v-model="form.tag_names" 
            class="form-control" 
            placeholder="Например: Гарри Поттер, Хогвартс"
          />
        </div>
        
        <div class="form-group">
          <label>Логика тегов</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="form.tag_logic" value="AND" checked />
              <span>AND (все теги)</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.tag_logic" value="OR" />
              <span>OR (любой тег)</span>
            </label>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="min_price">Минимальная цена</label>
            <input 
              type="number" 
              id="min_price" 
              v-model.number="form.min_price" 
              class="form-control" 
              min="0" 
              step="0.01"
              placeholder="От"
            />
          </div>
          
          <div class="form-group half">
            <label for="max_price">Максимальная цена</label>
            <input 
              type="number" 
              id="max_price" 
              v-model.number="form.max_price" 
              class="form-control" 
              min="0" 
              step="0.01"
              placeholder="До"
            />
          </div>
        </div>
        
        <div class="form-row" v-if="form.type === 'sets'">
          <div class="form-group half">
            <label for="min_piece_count">Минимум деталей</label>
            <input 
              type="number" 
              id="min_piece_count" 
              v-model.number="form.min_piece_count" 
              class="form-control" 
              min="0"
              placeholder="От"
            />
          </div>
          
          <div class="form-group half">
            <label for="max_piece_count">Максимум деталей</label>
            <input 
              type="number" 
              id="max_piece_count" 
              v-model.number="form.max_piece_count" 
              class="form-control" 
              min="0"
              placeholder="До"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="stage_duration_hours">Длительность одной стадии турнира (часов)</label>
          <input 
            type="number" 
            id="stage_duration_hours" 
            v-model.number="form.stage_duration_hours" 
            class="form-control" 
            min="1" 
            max="168"
            placeholder="По умолчанию: 24 часа"
          />
        </div>
      </div>
      
      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-cancel" 
          @click="$emit('cancel')"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn btn-submit" 
          :disabled="loading"
        >
          {{ loading ? 'Создание...' : 'Создать турнир' }}
        </button>
      </div>
    </form>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "TournamentCreateForm",
  data() {
    return {
      form: {
        title: '',
        type: 'sets',
        search: '',
        tag_names: '',
        tag_logic: 'AND',
        min_price: null,
        max_price: null,
        min_piece_count: null,
        max_piece_count: null,
        stage_duration_hours: 24
      },
      error: null,
      loading: false
    };
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated'
    })
  },
  methods: {
    async submitForm() {
      this.error = null;
      this.loading = true;
      
      if (!this.isAuthenticated) {
        this.error = 'Необходимо авторизоваться для создания турнира';
        this.loading = false;
        return;
      }
      
      try {
        // Создаем копию формы для обработки
        const formData = { ...this.form };
        
        // Очищаем пустые значения
        Object.keys(formData).forEach(key => {
          if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
            delete formData[key];
          }
        });
        
        // Проверка обязательных полей
        if (!formData.title) {
          throw new Error('Название турнира обязательно');
        }
        
        // Вызываем действие из хранилища
        const result = await this.$store.dispatch('createTournament', formData);
        
        // Выводим информацию об успехе
        this.$emit('created', result);
        
        // Перенаправляем на страницу турнира
        this.$router.push(`/tournaments/${result.tournament_id}`);
      } catch (error) {
        console.error('Ошибка при создании турнира:', error);
        this.error = error.response?.data?.detail || error.message || 'Ошибка при создании турнира';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tournament-create-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: var(--lego-border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--lego-black);
    text-align: center;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--lego-black);
    font-size: 1.2rem;
  }
  
  .form-section {
    background-color: rgba(0, 0, 0, 0.03);
    padding: 1.5rem;
    border-radius: var(--lego-border-radius);
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: var(--lego-dark-grey);
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--lego-grey);
      border-radius: var(--lego-border-radius);
      font-size: 1rem;
      
      &:focus {
        border-color: var(--lego-blue);
        outline: none;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
      }
    }
    
    &.half {
      width: 48%;
    }
  }
  
  .form-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    
    .form-group {
      flex: 1;
    }
  }
  
  .radio-group {
    display: flex;
    gap: 1.5rem;
    
    .radio-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      input {
        margin-right: 0.5rem;
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    
    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: var(--lego-border-radius);
      font-weight: bold;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s, transform 0.1s;
      
      &:active {
        transform: translateY(1px);
      }
      
      &.btn-cancel {
        background-color: var(--lego-grey);
        color: var(--lego-black);
        
        &:hover {
          background-color: darken(#E0E0E0, 10%);
        }
      }
      
      &.btn-submit {
        background-color: var(--lego-yellow);
        color: var(--lego-black);
        
        &:hover {
          background-color: darken(#FFC107, 10%);
        }
        
        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }
  }
  
  .error-message {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: rgba(255, 0, 0, 0.1);
    border-radius: var(--lego-border-radius);
    color: #d32f2f;
    text-align: center;
  }
}
</style> 