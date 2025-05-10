<template>
  <div class="tournament-details-container">
    <div v-if="loading" class="loading-indicator">
      <p>Загрузка данных о турнире...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchTournament" class="retry-button">Повторить загрузку</button>
    </div>
    
    <div v-else-if="tournament" class="tournament-details">
      <div class="tournament-header">
        <h1>{{ tournament.title }}</h1>
        <div class="tournament-meta">
          <span class="tournament-type" :class="tournament.type">
            {{ typeLabel }}
          </span>
          <span class="tournament-stage">
            {{ formatStage(tournament.current_stage) }}
          </span>
        </div>
      </div>
      
      <div class="tournament-status">
        <div class="status-item">
          <span class="label">Создан:</span>
          <span class="value">{{ formatDate(tournament.created_at) }}</span>
        </div>
        <div class="status-item">
          <span class="label">Дедлайн этапа:</span>
          <span class="value" :class="{'urgent': isDeadlineUrgent}">
            {{ formatDate(tournament.stage_deadline) }}
          </span>
        </div>
        <div class="status-item" v-if="remainingTime">
          <span class="label">Осталось:</span>
          <span class="value" :class="{'urgent': isDeadlineUrgent}">
            {{ remainingTime }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Участников:</span>
          <span class="value">{{ tournament.participants.length }}</span>
        </div>
      </div>
      
      <div class="tournament-actions" v-if="isAdmin">
        <button @click="confirmAndDeleteTournament" class="delete-btn">
          Удалить турнир
        </button>
      </div>
      
      <div v-if="hasStarted" class="tournament-bracket-wrapper">
        <tournament-bracket 
          :tournament="tournament" 
          @voted="onVoted" 
          @advanced="fetchTournament"
          @error="handleError"
        />
      </div>
      
      <div v-else class="tournament-participants">
        <h2>Участники турнира</h2>
        <div class="participants-grid">
          <div 
            v-for="participant in tournament.participants" 
            :key="participant.participant_id"
            class="participant-item"
            @click="openParticipantDetails(participant)"
          >
            <img 
              v-if="getParticipantImage(participant)" 
              :src="getParticipantImage(participant)" 
              :alt="getParticipantName(participant)"
              class="participant-image"
            />
            <div class="participant-details">
              <span class="participant-name">{{ getParticipantName(participant) }}</span>
              <span class="participant-position">#{{ participant.position }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>Турнир не найден</p>
      <router-link to="/tournaments" class="back-btn">
        Вернуться к списку турниров
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TournamentBracket from '@/components/TournamentBracket.vue';

export default {
  name: "TournamentDetailsView",
  components: {
    TournamentBracket
  },
  data() {
    return {
      timerId: null
    };
  },
  computed: {
    ...mapGetters({
      tournament: 'getCurrentTournament',
      loading: 'isLoading',
      error: 'getError',
      isAdmin: 'isAdmin'
    }),
    
    typeLabel() {
      if (!this.tournament) return '';
      return this.tournament.type === 'sets' ? 'Наборы' : 'Минифигурки';
    },
    
    hasStarted() {
      return this.tournament && this.tournament.pairs && this.tournament.pairs.length > 0;
    },
    
    remainingTime() {
      if (!this.tournament || !this.tournament.stage_deadline) return null;
      
      const deadline = new Date(this.tournament.stage_deadline);
      const now = new Date();
      const diff = deadline - now;
      
      if (diff <= 0) return 'Время истекло';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days} д ${hours} ч ${minutes} мин`;
      }
      
      return `${hours} ч ${minutes} мин`;
    },
    
    isDeadlineUrgent() {
      if (!this.tournament || !this.tournament.stage_deadline) return false;
      
      const deadline = new Date(this.tournament.stage_deadline);
      const now = new Date();
      const diff = deadline - now;
      
      // Менее 6 часов считаем срочным
      return diff > 0 && diff < 6 * 60 * 60 * 1000;
    }
  },
  methods: {
    ...mapActions([
      'fetchTournamentById',
      'deleteTournament'
    ]),
    
    async fetchTournament() {
      try {
        const tournamentId = this.$route.params.id;
        await this.fetchTournamentById(tournamentId);
      } catch (error) {
        console.error('Ошибка при загрузке турнира:', error);
      }
    },
    
    async confirmAndDeleteTournament() {
      if (!this.tournament) return;
      
      if (confirm(`Вы уверены, что хотите удалить турнир "${this.tournament.title}"?`)) {
        try {
          await this.deleteTournament(this.tournament.tournament_id);
          this.$router.push('/tournaments');
        } catch (error) {
          console.error('Ошибка при удалении турнира:', error);
        }
      }
    },
    
    getParticipantName(participant) {
      if (!participant) return 'Неизвестный участник';
      
      if (participant.set) {
        return participant.set.name;
      } else if (participant.minifigure) {
        return participant.minifigure.name;
      }
      
      return `Участник #${participant.participant_id}`;
    },
    
    getParticipantImage(participant) {
      if (!participant) return '';
      
      if (participant.set && participant.set.face_photo) {
        return participant.set.face_photo.photo_url;
      } else if (participant.minifigure && participant.minifigure.face_photo) {
        return participant.minifigure.face_photo.photo_url;
      }
      
      return require('@/assets/images/default-set.png');
    },
    
    openParticipantDetails(participant) {
      if (!participant) return;
      
      if (participant.set) {
        this.$router.push(`/sets/${participant.set.set_id}`);
      } else if (participant.minifigure) {
        this.$router.push(`/minifigures/${participant.minifigure.minifigure_id}`);
      }
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
    },
    
    onVoted(data) {
      // Обновляем данные турнира после голосования
      this.fetchTournament();
    },
    
    handleError(errorMessage) {
      alert(errorMessage);
    },
    
    startTimeUpdater() {
      // Обновляем оставшееся время каждую минуту
      this.timerId = setInterval(() => {
        this.$forceUpdate();
      }, 60000);
    },
    
    stopTimeUpdater() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }
  },
  mounted() {
    this.fetchTournament();
    this.startTimeUpdater();
  },
  beforeUnmount() {
    this.stopTimeUpdater();
  }
};
</script>

<style lang="scss" scoped>
.tournament-details-container {
  padding: 2rem;
  
  .loading-indicator, .error-message, .not-found {
    text-align: center;
    padding: 3rem 0;
    
    p {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .retry-button, .back-btn {
      padding: 0.5rem 1rem;
      background-color: var(--lego-blue);
      color: white;
      border: none;
      border-radius: var(--lego-border-radius);
      cursor: pointer;
      display: inline-block;
      text-decoration: none;
      
      &:hover {
        background-color: darken(#2196F3, 10%);
      }
    }
  }
  
  .error-message p {
    color: #d32f2f;
  }
  
  .tournament-details {
    .tournament-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      
      h1 {
        margin: 0;
        color: var(--lego-black);
      }
      
      .tournament-meta {
        display: flex;
        gap: 1rem;
        
        .tournament-type, .tournament-stage {
          padding: 0.3rem 0.7rem;
          border-radius: var(--lego-border-radius);
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .tournament-type {
          &.sets {
            background-color: #4CAF50;
            color: white;
          }
          
          &.minifigures {
            background-color: #2196F3;
            color: white;
          }
        }
        
        .tournament-stage {
          background-color: var(--lego-yellow);
          color: var(--lego-black);
        }
      }
    }
    
    .tournament-status {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      background-color: rgba(0, 0, 0, 0.03);
      padding: 1rem;
      border-radius: var(--lego-border-radius);
      margin-bottom: 2rem;
      
      .status-item {
        display: flex;
        flex-direction: column;
        
        .label {
          font-size: 0.8rem;
          color: var(--lego-dark-grey);
          margin-bottom: 0.2rem;
        }
        
        .value {
          font-weight: bold;
          
          &.urgent {
            color: #d32f2f;
          }
        }
      }
    }
    
    .tournament-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
      
      .delete-btn {
        padding: 0.5rem 1rem;
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: var(--lego-border-radius);
        cursor: pointer;
        
        &:hover {
          background-color: darken(#f44336, 10%);
        }
      }
    }
    
    .tournament-bracket-wrapper {
      margin: 2rem 0;
    }
    
    .tournament-participants {
      margin-top: 2rem;
      
      h2 {
        margin-bottom: 1.5rem;
        color: var(--lego-black);
      }
      
      .participants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        
        .participant-item {
          background-color: white;
          border-radius: var(--lego-border-radius);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.8rem;
          transition: transform 0.2s, box-shadow 0.2s;
          
          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
          
          .participant-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: var(--lego-border-radius);
            margin-right: 1rem;
          }
          
          .participant-details {
            flex: 1;
            
            .participant-name {
              display: block;
              font-weight: bold;
              margin-bottom: 0.3rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .participant-position {
              display: block;
              font-size: 0.9rem;
              color: var(--lego-dark-grey);
            }
          }
        }
      }
    }
  }
}
</style> 