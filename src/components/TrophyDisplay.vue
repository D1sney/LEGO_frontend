<template>
  <div v-if="trophies && trophies.length > 0" class="trophy-display">
    <h3 class="trophy-title">
      <img src="@/assets/images/trophy.png" alt="Trophy" class="trophy-icon-img">
      Кубки победителя
    </h3>
    
    <div class="trophy-list">
      <div 
        v-for="trophy in trophies" 
        :key="trophy.winner_id"
        class="trophy-item"
        @click="goToTournament(trophy.tournament_id)"
        :title="`Победитель турнира: ${trophy.tournament?.title || 'Турнир #' + trophy.tournament_id}`"
      >
        <div class="trophy-icon-container">
          <img src="@/assets/images/trophy.png" alt="Trophy" class="trophy-icon-img">
        </div>
        
        <div class="trophy-info">
          <div class="trophy-tournament">
            {{ trophy.tournament?.title || `Турнир #${trophy.tournament_id}` }}
          </div>
          <div class="trophy-date">
            {{ formatDate(trophy.won_at) }}
          </div>
          <div v-if="trophy.total_votes > 0" class="trophy-votes">
            {{ trophy.total_votes }} голосов
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrophyDisplay',
  props: {
    trophies: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    goToTournament(tournamentId) {
      this.$router.push(`/tournaments/${tournamentId}`);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.trophy-display {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff9c4 0%, #fff3a0 100%);
  border-radius: var(--lego-border-radius);
  border: 2px solid #ffd700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  
  .trophy-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #b8860b;
    font-size: 1.3rem;
    
    .trophy-icon-img {
      width: 24px;
      height: 24px;
    }
  }
  
  .trophy-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .trophy-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: var(--lego-border-radius);
    border: 1px solid #e6d700;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 200px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .trophy-icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      
      img {
        width: 24px;
        height: 24px;
      }
    }
    
    .trophy-info {
      flex: 1;
      
      .trophy-tournament {
        font-weight: bold;
        color: var(--lego-black);
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
        line-height: 1.2;
      }
      
      .trophy-date {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.1rem;
      }
      
      .trophy-votes {
        font-size: 0.75rem;
        color: #888;
        font-style: italic;
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .trophy-display {
    .trophy-list {
      flex-direction: column;
    }
    
    .trophy-item {
      min-width: auto;
      width: 100%;
    }
  }
}
</style> 