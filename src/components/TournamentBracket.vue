<template>
  <div class="tournament-bracket-container">
    <h2 class="bracket-title">{{ title }}</h2>
    
    <div class="tournament-bracket" ref="bracketContainer">
      <div 
        v-for="(stage, stageIndex) in stages" 
        :key="stageIndex" 
        class="bracket-stage"
        :class="{ 'active-stage': isActiveStage(stage.name) }"
      >
        <h3 class="stage-name">{{ formatStageName(stage.name) }}</h3>
        
        <div class="stage-pairs">
          <div 
            v-for="pair in getPairsForStage(stage.name)" 
            :key="pair.pair_id" 
            class="bracket-pair"
            :class="{ 
              'has-winner': pair.winner_id,
              'can-vote': canVoteForPair(pair)
            }"
          >
            <div 
              class="pair-participant"
              :class="{ 
                'winner': pair.winner_id === pair.participant1_id,
                'loser': pair.winner_id && pair.winner_id !== pair.participant1_id
              }"
              @click="openParticipantDetails(pair.participant1)"
            >
              <img 
                :src="getParticipantImage(pair.participant1)" 
                :alt="getParticipantName(pair.participant1)"
                class="participant-image"
              />
              <div class="participant-details">
                <span class="participant-name">{{ getParticipantName(pair.participant1) }}</span>
                <div class="vote-info" v-if="showVotes(pair)">
                  <span class="vote-count">{{ pair.votes_for_participant1 || 0 }} голосов</span>
                </div>
              </div>
            </div>
            
            <div class="pair-vs">VS</div>
            
            <div 
              v-if="pair.participant2" 
              class="pair-participant"
              :class="{ 
                'winner': pair.winner_id === pair.participant2_id,
                'loser': pair.winner_id && pair.winner_id !== pair.participant2_id
              }"
              @click="openParticipantDetails(pair.participant2)"
            >
              <img 
                :src="getParticipantImage(pair.participant2)" 
                :alt="getParticipantName(pair.participant2)"
                class="participant-image"
              />
              <div class="participant-details">
                <span class="participant-name">{{ getParticipantName(pair.participant2) }}</span>
                <div class="vote-info" v-if="showVotes(pair)">
                  <span class="vote-count">{{ pair.votes_for_participant2 || 0 }} голосов</span>
                </div>
              </div>
            </div>
            
            <div v-else class="pair-participant empty">
              <span class="participant-name">TBD</span>
            </div>
            
            <div class="pair-actions" v-if="canVoteForPair(pair)">
              <button 
                @click.stop="vote(pair, pair.participant1_id)" 
                class="vote-button"
                :class="{ 'voted-for': hasVotedFor(pair, pair.participant1_id) }"
              >
                Голосовать
              </button>
              <button 
                v-if="pair.participant2"
                @click.stop="vote(pair, pair.participant2_id)" 
                class="vote-button"
                :class="{ 'voted-for': hasVotedFor(pair, pair.participant2_id) }"
              >
                Голосовать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tournament-controls" v-if="isAdmin">
      <button @click="advanceToNextStage" class="advance-button">
        Перейти к следующей стадии
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "TournamentBracket",
  props: {
    tournament: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      default: "Турнирная сетка"
    }
  },
  data() {
    return {
      userVotes: new Set(), // Хранит ID пар, за которые проголосовал пользователь
      stageOrder: [
        'round_of_128',
        'round_of_64',
        'round_of_32',
        'round_of_16',
        'quarterfinal',
        'semifinal',
        'final'
      ]
    };
  },
  computed: {
    ...mapGetters({
      isAdmin: 'isAdmin',
      user: 'getUser'
    }),
    
    stages() {
      if (!this.tournament || !this.tournament.pairs) return [];
      
      // Получаем уникальные стадии из пар
      const stageNames = [...new Set(this.tournament.pairs.map(pair => pair.stage))];
      
      // Сортируем стадии в правильном порядке
      stageNames.sort((a, b) => {
        return this.stageOrder.indexOf(a) - this.stageOrder.indexOf(b);
      });
      
      return stageNames.map(name => ({ name }));
    },
    
    votedPairs() {
      if (!this.tournament || !this.tournament.pairs) return [];
      
      const pairs = this.tournament.pairs;
      const userId = this.user?.user_id;
      
      if (!userId) return [];
      
      return pairs.filter(pair => 
        pair.votes && pair.votes.some(vote => vote.user_id === userId)
      );
    }
  },
  created() {
    // Заполняем список пар, за которые пользователь уже проголосовал
    this.updateUserVotes();
  },
  mounted() {
    // При необходимости можно добавить масштабирование или иные эффекты для отображения
  },
  methods: {
    updateUserVotes() {
      this.userVotes = new Set();
      if (!this.tournament || !this.tournament.pairs || !this.user) return;
      
      const userId = this.user.user_id;
      
      this.tournament.pairs.forEach(pair => {
        if (pair.votes && pair.votes.some(vote => vote.user_id === userId)) {
          this.userVotes.add(pair.pair_id);
        }
      });
    },
    
    getPairsForStage(stageName) {
      if (!this.tournament || !this.tournament.pairs) return [];
      
      return this.tournament.pairs.filter(pair => pair.stage === stageName);
    },
    
    formatStageName(stageName) {
      switch(stageName) {
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
        case 'round_of_128':
          return '1/64 финала';
        default:
          if (stageName.startsWith('round_of_')) {
            const number = stageName.replace('round_of_', '');
            return `1/${number} финала`;
          }
          return stageName;
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
      
      if (participant.set) {
        if (participant.set.face_photo && participant.set.face_photo.photo_url) {
          return participant.set.face_photo.photo_url;
        }
        return require('@/assets/images/default-set.png');
      } else if (participant.minifigure) {
        if (participant.minifigure.face_photo && participant.minifigure.face_photo.photo_url) {
          return participant.minifigure.face_photo.photo_url;
        }
        return require('@/assets/images/default-figure.png');
      }
      
      return require('@/assets/images/default-set.png');
    },
    
    isActiveStage(stageName) {
      return this.tournament.current_stage === stageName;
    },
    
    canVoteForPair(pair) {
      // Можно голосовать, если:
      // 1. Пара принадлежит текущей активной стадии
      // 2. Нет победителя
      // 3. Пользователь еще не голосовал за эту пару
      // 4. В паре есть два участника
      return (
        pair.stage === this.tournament.current_stage &&
        !pair.winner_id &&
        !this.hasVotedForPair(pair) &&
        pair.participant2 !== null
      );
    },
    
    hasVotedForPair(pair) {
      return this.userVotes.has(pair.pair_id);
    },
    
    hasVotedFor(pair, participantId) {
      if (!this.tournament || !this.user || !pair.votes) return false;
      
      const userId = this.user.user_id;
      
      return pair.votes.some(vote => 
        vote.user_id === userId && vote.voted_for === participantId
      );
    },
    
    showVotes(pair) {
      // Показываем голоса, если:
      // 1. Пользователь проголосовал за эту пару
      // 2. Или есть победитель (стадия завершена)
      return this.hasVotedForPair(pair) || pair.winner_id !== null;
    },
    
    async vote(pair, participantId) {
      if (!this.tournament || !this.user) return;
      
      try {
        // Вызываем действие из хранилища для голосования
        await this.$store.dispatch('voteForParticipant', {
          tournamentId: this.tournament.tournament_id,
          pairId: pair.pair_id,
          votedFor: participantId
        });
        
        // Обновляем список голосов пользователя
        this.userVotes.add(pair.pair_id);
        
        // Показываем уведомление об успешном голосовании
        this.$emit('voted', { pairId: pair.pair_id, participantId });
      } catch (error) {
        console.error('Ошибка при голосовании:', error);
        this.$emit('error', error.message || 'Ошибка при голосовании');
      }
    },
    
    async advanceToNextStage() {
      if (!this.tournament || !this.isAdmin) return;
      
      try {
        // Вызываем действие из хранилища для перехода к следующей стадии
        await this.$store.dispatch('advanceToNextStage', {
          tournamentId: this.tournament.tournament_id
        });
        
        // Показываем уведомление об успешном переходе
        this.$emit('advanced');
      } catch (error) {
        console.error('Ошибка при переходе к следующей стадии:', error);
        this.$emit('error', error.message || 'Ошибка при переходе к следующей стадии');
      }
    },
    
    openParticipantDetails(participant) {
      if (!participant) return;
      
      if (participant.set) {
        this.$router.push(`/sets/${participant.set.set_id}`);
      } else if (participant.minifigure) {
        this.$router.push(`/minifigures/${participant.minifigure.minifigure_id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tournament-bracket-container {
  width: 100%;
  overflow-x: auto;
  padding: 1rem 0;
  
  .bracket-title {
    margin-bottom: 1.5rem;
    text-align: center;
    color: var(--lego-black);
  }
}

.tournament-bracket {
  display: flex;
  justify-content: flex-start;
  gap: 2rem;
  min-width: max-content;
  padding: 0 1rem;
  
  .bracket-stage {
    flex: 1;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.3s;
    
    &.active-stage {
      opacity: 1;
    }
    
    .stage-name {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      text-align: center;
      padding: 0.5rem 1rem;
      border-radius: var(--lego-border-radius);
      background-color: var(--lego-yellow);
      color: var(--lego-black);
      width: 100%;
    }
    
    .stage-pairs {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }
  }
}

.bracket-pair {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  position: relative;
  
  &.has-winner {
    border: 2px solid var(--lego-green);
  }
  
  &.can-vote {
    cursor: pointer;
    border: 2px solid var(--lego-blue);
    
    &:hover {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
  }
  
  .pair-participant {
    display: flex;
    padding: 0.5rem;
    border-radius: var(--lego-border-radius);
    cursor: pointer;
    transition: background-color 0.2s;
    align-items: center;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    &.winner {
      background-color: rgba(76, 175, 80, 0.2);
    }
    
    &.loser {
      opacity: 0.6;
    }
    
    &.empty {
      opacity: 0.5;
      cursor: default;
      justify-content: center;
      padding: 1rem;
      
      &:hover {
        background-color: transparent;
      }
    }
    
    .participant-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: var(--lego-border-radius);
      margin-right: 0.5rem;
    }
    
    .participant-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .participant-name {
        font-weight: bold;
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .vote-info {
        font-size: 0.8rem;
        color: var(--lego-dark-grey);
        
        .vote-count {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
        }
      }
    }
  }
  
  .pair-vs {
    text-align: center;
    font-weight: bold;
    font-size: 0.9rem;
    color: var(--lego-dark-grey);
    margin: 0.3rem 0;
    text-transform: uppercase;
  }
  
  .pair-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    gap: 0.5rem;
    
    .vote-button {
      flex: 1;
      padding: 0.3rem;
      border-radius: var(--lego-border-radius);
      background-color: var(--lego-blue);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: darken(#2196F3, 10%);
      }
      
      &.voted-for {
        background-color: var(--lego-green);
        
        &:hover {
          background-color: darken(#4CAF50, 10%);
        }
      }
    }
  }
}

.tournament-controls {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  
  .advance-button {
    padding: 0.5rem 1rem;
    border-radius: var(--lego-border-radius);
    background-color: var(--lego-yellow);
    color: var(--lego-black);
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: darken(#FFC107, 10%);
    }
  }
}
</style> 