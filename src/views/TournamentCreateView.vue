<template>
  <div class="tournament-create-view">
    <h1>Создание нового турнира</h1>
    
    <tournament-create-form 
      @created="onTournamentCreated" 
      @cancel="goBack"
    />
  </div>
</template>

<script>
import TournamentCreateForm from '@/components/TournamentCreateForm.vue';

export default {
  name: 'TournamentCreateView',
  components: {
    TournamentCreateForm
  },
  methods: {
    onTournamentCreated(tournament) {
      // Перенаправление на страницу просмотра турнира происходит внутри формы
    },
    goBack() {
      this.$router.push('/tournaments');
    }
  }
};
</script>

<style lang="scss" scoped>
.tournament-create-view {
  padding: 2rem;
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--lego-black);
  }
}
</style> 