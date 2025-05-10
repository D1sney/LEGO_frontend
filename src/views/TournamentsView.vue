<template>
  <div class="tournaments-container">
    <div class="tournaments-header">
      <h1>Турниры LEGO</h1>
      <button @click="showCreateForm = true" class="create-tournament-btn">
        Создать турнир
      </button>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <p>Загрузка турниров...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchTournaments" class="retry-button">Повторить загрузку</button>
    </div>
    
    <div v-else-if="tournaments.length === 0" class="empty-state">
      <p>Нет доступных турниров</p>
      <button @click="showCreateForm = true" class="create-tournament-btn">
        Создать первый турнир
      </button>
    </div>
    
    <div v-else class="tournaments-list">
      <tournament-card 
        v-for="tournament in tournaments" 
        :key="tournament.tournament_id" 
        :tournament="tournament"
      />
    </div>
    
    <div v-if="showCreateForm" class="create-form-overlay" @click.self="showCreateForm = false">
      <div class="create-form-wrapper">
        <tournament-create-form 
          @created="onTournamentCreated" 
          @cancel="showCreateForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TournamentCard from '@/components/TournamentCard.vue';
import TournamentCreateForm from '@/components/TournamentCreateForm.vue';

export default {
  name: 'TournamentsView',
  components: {
    TournamentCard,
    TournamentCreateForm
  },
  data() {
    return {
      showCreateForm: false
    };
  },
  computed: {
    ...mapGetters({
      tournaments: 'getTournaments',
      loading: 'isLoading',
      error: 'getError'
    })
  },
  methods: {
    ...mapActions(['fetchTournaments']),
    
    onTournamentCreated(tournament) {
      this.showCreateForm = false;
      this.fetchTournaments();
    }
  },
  mounted() {
    this.fetchTournaments();
  }
};
</script>

<style lang="scss" scoped>
.tournaments-container {
  padding: 2rem;
  
  .tournaments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h1 {
      margin: 0;
      color: var(--lego-black);
    }
    
    .create-tournament-btn {
      padding: 0.7rem 1.2rem;
      background-color: var(--lego-yellow);
      color: var(--lego-black);
      border: none;
      border-radius: var(--lego-border-radius);
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      
      &:hover {
        background-color: darken(#FFC107, 10%);
      }
      
      &:active {
        transform: translateY(1px);
      }
    }
  }
  
  .tournaments-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .loading-indicator, .error-message, .empty-state {
    text-align: center;
    padding: 3rem 0;
    
    p {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .retry-button {
      padding: 0.5rem 1rem;
      background-color: var(--lego-blue);
      color: white;
      border: none;
      border-radius: var(--lego-border-radius);
      cursor: pointer;
      
      &:hover {
        background-color: darken(#2196F3, 10%);
      }
    }
  }
  
  .error-message p {
    color: #d32f2f;
  }
  
  .empty-state {
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: var(--lego-border-radius);
    padding: 3rem;
  }
  
  .create-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    
    .create-form-wrapper {
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      border-radius: var(--lego-border-radius);
    }
  }
}
</style> 