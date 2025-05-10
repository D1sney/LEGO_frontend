<template>
  <div class="tournament-card" @click="navigateToDetails">
    <div class="tournament-card-header">
      <h3>{{ tournament.title }}</h3>
      <span class="tournament-type" :class="tournament.type">
        {{ typeLabel }}
      </span>
    </div>
    
    <div class="tournament-card-content">
      <div class="tournament-info">
        <p><strong>Текущая стадия:</strong> {{ formatStage(tournament.current_stage) }}</p>
        <p><strong>Участников:</strong> {{ tournament.participants_count }}</p>
        <p v-if="remainingTime">
          <strong>Осталось:</strong> 
          <span :class="{'urgent': isUrgent}">{{ remainingTime }}</span>
        </p>
      </div>
      
      <div class="tournament-date">
        <p><strong>Создан:</strong> {{ formatDate(tournament.created_at) }}</p>
        <p><strong>Дедлайн этапа:</strong> {{ formatDate(tournament.stage_deadline) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TournamentCard",
  props: {
    tournament: {
      type: Object,
      required: true,
    },
  },
  computed: {
    typeLabel() {
      return this.tournament.type === 'sets' ? 'Наборы' : 'Минифигурки';
    },
    remainingTime() {
      if (!this.tournament.stage_deadline) return null;
      
      const deadline = new Date(this.tournament.stage_deadline);
      const now = new Date();
      const diff = deadline - now;
      
      if (diff <= 0) return 'Время истекло';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours} ч ${minutes} мин`;
    },
    isUrgent() {
      if (!this.tournament.stage_deadline) return false;
      
      const deadline = new Date(this.tournament.stage_deadline);
      const now = new Date();
      const diff = deadline - now;
      
      // Менее 6 часов считаем срочным
      return diff > 0 && diff < 6 * 60 * 60 * 1000;
    }
  },
  methods: {
    navigateToDetails() {
      this.$router.push(`/tournaments/${this.tournament.tournament_id}`);
    },
    formatDate(dateString) {
      if (!dateString) return 'Н/Д';
      
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatStage(stage) {
      if (!stage) return 'Н/Д';
      
      switch(stage) {
        case 'final':
          return 'Финал';
        case 'semifinal':
          return 'Полуфинал';
        case 'quarterfinal':
          return 'Четвертьфинал';
        case 'round_of_16':
          return '1/8 финала';
        case 'round_of_32':
          return '1/16 финала';
        case 'round_of_64':
          return '1/32 финала';
        default:
          if (stage.startsWith('round_of_')) {
            const number = stage.replace('round_of_', '');
            return `1/${number} финала`;
          }
          return stage;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.tournament-card {
  background-color: white;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .tournament-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    
    .tournament-type {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      
      &.sets {
        background-color: #4CAF50;
        color: white;
      }
      
      &.minifigures {
        background-color: #2196F3;
        color: white;
      }
    }
  }
  
  .tournament-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .tournament-info, .tournament-date {
      p {
        margin: 0.3rem 0;
        font-size: 0.9rem;
      }
    }
    
    .urgent {
      color: #ff3d00;
      font-weight: bold;
    }
  }
}
</style> 