<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <img src="@/assets/images/background.png" alt="LEGO Background" class="hero-bg-image">
        <div class="hero-overlay"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-character">
          <img src="@/assets/images/lava-anakyn.png" alt="Anakin Skywalker" class="hero-character-img">
        </div>
        
        <div class="hero-text">
          <h1 class="hero-title">Добро пожаловать в мир LEGO!</h1>
          <p class="hero-subtitle">
            Исследуйте удивительную коллекцию наборов и минифигурок, 
            участвуйте в захватывающих турнирах и откройте для себя 
            безграничные возможности LEGO вселенной
          </p>
          
          <div class="hero-buttons">
            <router-link to="/collection?type=sets" class="hero-btn hero-btn-primary">
              <i class="fas fa-cubes"></i>
              Посмотреть наборы
            </router-link>
            <router-link to="/collection?type=minifigures" class="hero-btn hero-btn-secondary">
              <i class="fas fa-user"></i>
              Изучить минифигурки
            </router-link>
            <router-link to="/tournaments" class="hero-btn hero-btn-accent">
              <img src="@/assets/images/trophy.png" alt="Trophy" class="btn-trophy-icon">
              Турниры
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="stats-section">
      <div class="container">
        <h2 class="section-title">Статистика коллекции</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-cubes"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.setsCount }}</div>
              <div class="stat-label">Наборов LEGO</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.minifiguresCount }}</div>
              <div class="stat-label">Минифигурок</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <img src="@/assets/images/trophy.png" alt="Trophy" class="stat-trophy-icon">
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.tournamentsCount }}</div>
              <div class="stat-label">Активных турниров</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Content Section -->
    <section class="featured-section">
      <div class="container">
        <!-- Latest Sets -->
        <div class="featured-subsection">
          <h2 class="section-title">Последние наборы</h2>
          <div class="featured-grid" v-if="latestSets.length > 0">
            <router-link 
              v-for="set in latestSets.slice(0, 4)" 
              :key="set.set_id" 
              :to="`/sets/${set.set_id}`" 
              class="featured-card"
            >
              <div class="featured-card-image">
                <img
                  :src="set.face_photo?.photo_url || defaultSetImage"
                  :alt="set.name"
                />
              </div>
              <div class="featured-card-content">
                <h3>{{ set.name }}</h3>
                <p class="featured-card-meta">{{ set.theme }} • {{ set.release_year }}</p>
                <div class="featured-card-price">{{ formatPrice(set.price) }} ₽</div>
              </div>
            </router-link>
          </div>
          <div class="section-link">
            <router-link to="/collection?type=sets" class="view-all-btn">
              Посмотреть все наборы
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <!-- Popular Minifigures -->
        <div class="featured-subsection">
          <h2 class="section-title">Популярные минифигурки</h2>
          <div class="featured-grid" v-if="popularMinifigures.length > 0">
            <router-link
              v-for="figure in popularMinifigures.slice(0, 4)"
              :key="figure.minifigure_id"
              :to="`/minifigures/${figure.minifigure_id}`"
              class="featured-card"
            >
              <div class="featured-card-image">
                <img
                  :src="figure.face_photo?.photo_url || defaultFigureImage"
                  :alt="figure.name"
                />
              </div>
              <div class="featured-card-content">
                <h3>{{ figure.name }}</h3>
                <p class="featured-card-meta">{{ figure.character_name }}</p>
                <div v-if="figure.price" class="featured-card-price">
                  {{ formatPrice(figure.price) }} ₽
                </div>
              </div>
            </router-link>
          </div>
          <div class="section-link">
            <router-link to="/collection?type=minifigures" class="view-all-btn">
              Посмотреть все минифигурки
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <!-- Active Tournaments -->
        <div class="featured-subsection" v-if="activeTournaments.length > 0">
          <h2 class="section-title">Активные турниры</h2>
          <div class="tournaments-grid">
            <router-link
              v-for="tournament in activeTournaments.slice(0, 3)"
              :key="tournament.tournament_id"
              :to="`/tournaments/${tournament.tournament_id}`"
              class="tournament-card"
            >
              <div class="tournament-card-header">
                <img src="@/assets/images/trophy.png" alt="Trophy" class="tournament-trophy">
                <div class="tournament-status">{{ formatStageName(tournament.current_stage) }}</div>
              </div>
              <div class="tournament-card-content">
                <h3>{{ tournament.title }}</h3>
                <p class="tournament-meta">
                  {{ tournament.type === 'sets' ? 'Наборы' : 'Минифигурки' }} • 
                  {{ tournament.participants_count }} участников
                </p>
                <div class="tournament-deadline">
                  До {{ formatDate(tournament.stage_deadline) }}
                </div>
              </div>
            </router-link>
          </div>
          <div class="section-link">
            <router-link to="/tournaments" class="view-all-btn">
              Все турниры
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="about-background">
        <img src="@/assets/images/volandemort.png" alt="Voldemort and Hogwarts" class="about-bg-image">
        <div class="about-overlay"></div>
      </div>
      
      <div class="container">
        <div class="about-content">
          <div class="about-text">
            <h2>О проекте</h2>
            <p>
              Добро пожаловать в уникальную платформу для коллекционеров LEGO! 
              Здесь вы можете управлять своей коллекцией наборов и минифигурок, 
              участвовать в захватывающих турнирах и открывать для себя новые 
              удивительные творения из мира LEGO.
            </p>
            <p>
              Наша платформа объединяет любителей LEGO со всего мира, предоставляя 
              инструменты для каталогизации коллекций, проведения турниров и обмена 
              опытом с единомышленниками.
            </p>
          </div>
          
          <div class="about-characters">
            <img src="@/assets/images/obi-van.png" alt="Obi-Wan Kenobi" class="about-character">
            <img src="@/assets/images/anakyn.png" alt="Anakin Skywalker" class="about-character">
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Загрузка данных...</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: "HomeView",
  data() {
    return {
      loading: true,
      defaultSetImage: require("@/assets/images/default-set.png"),
      defaultFigureImage: require("@/assets/images/default-figure.png"),
      latestSets: [],
      popularMinifigures: [],
      activeTournaments: [],
      stats: {
        setsCount: 0,
        minifiguresCount: 0,
        tournamentsCount: 0
      }
    };
  },
  computed: {
    ...mapGetters({
      sets: 'getSets',
      minifigures: 'getMinifigures',
      tournaments: 'getTournaments'
    })
  },
  async mounted() {
    await this.loadHomeData();
  },
  methods: {
    ...mapActions(['fetchSets', 'fetchMinifigures', 'fetchTournaments']),
    
    async loadHomeData() {
      this.loading = true;
      
      try {
        // Загружаем данные параллельно
        await Promise.all([
          this.loadLatestSets(),
          this.loadPopularMinifigures(),
          this.loadActiveTournaments()
        ]);
        
        // Обновляем статистику
        this.updateStats();
        
      } catch (error) {
        console.error('Ошибка при загрузке данных главной страницы:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadLatestSets() {
      try {
        const response = await this.fetchSets({ limit: 8, offset: 0 });
        this.latestSets = response || [];
        this.stats.setsCount = this.latestSets.length;
      } catch (error) {
        console.error('Ошибка при загрузке наборов:', error);
        this.latestSets = [];
      }
    },
    
    async loadPopularMinifigures() {
      try {
        const response = await this.fetchMinifigures({ limit: 8, offset: 0 });
        this.popularMinifigures = response || [];
        this.stats.minifiguresCount = this.popularMinifigures.length;
      } catch (error) {
        console.error('Ошибка при загрузке минифигурок:', error);
        this.popularMinifigures = [];
      }
    },
    
    async loadActiveTournaments() {
      try {
        const response = await this.fetchTournaments();
        this.activeTournaments = response || [];
        this.stats.tournamentsCount = this.activeTournaments.length;
      } catch (error) {
        console.error('Ошибка при загрузке турниров:', error);
        this.activeTournaments = [];
      }
    },
    
    updateStats() {
      // Обновляем статистику на основе загруженных данных
      this.stats.setsCount = this.latestSets.length;
      this.stats.minifiguresCount = this.popularMinifigures.length;
      this.stats.tournamentsCount = this.activeTournaments.length;
    },
    
    formatPrice(price) {
      if (!price) return 'Цена не указана';
      return new Intl.NumberFormat("ru-RU").format(price);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    formatStageName(stageName) {
      const stageNames = {
        'final': 'Финал',
        'semifinal': 'Полуфинал',
        'quarterfinal': 'Четвертьфинал',
        'round_of_16': '1/8 финала',
        'round_of_32': '1/16 финала',
        'round_of_64': '1/32 финала',
        'round_of_128': '1/64 финала'
      };
      
      return stageNames[stageName] || stageName;
    }
  }
};
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}

// Hero Section
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .hero-bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.4) 100%
      );
    }
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    
    .hero-character {
      flex: 0 0 auto;
      
      .hero-character-img {
        width: 300px;
        height: auto;
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
        animation: float 3s ease-in-out infinite;
      }
    }
    
    .hero-text {
      flex: 1;
      color: white;
      text-align: left;
      
      .hero-title {
        font-size: 3.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .hero-subtitle {
        font-size: 1.3rem;
        margin-bottom: 2.5rem;
        line-height: 1.6;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        max-width: 600px;
      }
      
      .hero-buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .hero-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        border-radius: var(--lego-border-radius);
        text-decoration: none;
        font-weight: bold;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        &.hero-btn-primary {
          background: linear-gradient(135deg, var(--lego-blue) 0%, #1976D2 100%);
          color: white;
        }
        
        &.hero-btn-secondary {
          background: linear-gradient(135deg, var(--lego-green) 0%, #388E3C 100%);
          color: white;
        }
        
        &.hero-btn-accent {
          background: linear-gradient(135deg, var(--lego-yellow) 0%, #F57C00 100%);
          color: var(--lego-black);
          
          .btn-trophy-icon {
            width: 20px;
            height: 20px;
          }
        }
        
        i {
          font-size: 1.2rem;
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

// Container
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Section Titles
.section-title {
  font-size: 2.5rem;
  color: var(--lego-black);
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, var(--lego-yellow), var(--lego-red));
    margin: 1rem auto 0;
    border-radius: 2px;
  }
}

// Stats Section
.stats-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    
    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: var(--lego-border-radius);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--lego-yellow) 0%, var(--lego-red) 100%);
        
        i {
          font-size: 1.8rem;
          color: white;
        }
        
        .stat-trophy-icon {
          width: 30px;
          height: 30px;
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--lego-blue);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 1.1rem;
          color: var(--lego-dark-grey);
          margin-top: 0.5rem;
        }
      }
    }
  }
}

// Featured Section
.featured-section {
  padding: 5rem 0;
  
  .featured-subsection {
    margin-bottom: 5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .featured-card {
    background: white;
    border-radius: var(--lego-border-radius);
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .featured-card-image {
      height: 200px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }
    
    &:hover .featured-card-image img {
      transform: scale(1.05);
    }
    
    .featured-card-content {
      padding: 1.5rem;
      
      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: var(--lego-black);
        line-height: 1.3;
      }
      
      .featured-card-meta {
        color: var(--lego-dark-grey);
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }
      
      .featured-card-price {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--lego-red);
      }
    }
  }
  
  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .tournament-card {
    background: white;
    border-radius: var(--lego-border-radius);
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .tournament-card-header {
      background: linear-gradient(135deg, var(--lego-yellow) 0%, var(--lego-red) 100%);
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .tournament-trophy {
        width: 30px;
        height: 30px;
      }
      
      .tournament-status {
        background: rgba(255, 255, 255, 0.9);
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--lego-black);
      }
    }
    
    .tournament-card-content {
      padding: 1.5rem;
      
      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: var(--lego-black);
      }
      
      .tournament-meta {
        color: var(--lego-dark-grey);
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }
      
      .tournament-deadline {
        font-size: 0.9rem;
        color: var(--lego-red);
        font-weight: bold;
      }
    }
  }
  
  .section-link {
    text-align: center;
    
    .view-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--lego-blue) 0%, #1976D2 100%);
      color: white;
      text-decoration: none;
      border-radius: var(--lego-border-radius);
      font-weight: bold;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      
      i {
        transition: transform 0.3s ease;
      }
      
      &:hover i {
        transform: translateX(5px);
      }
    }
  }
}

// About Section
.about-section {
  position: relative;
  padding: 5rem 0;
  overflow: hidden;
  
  .about-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .about-bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    }
    
    .about-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.7) 100%
      );
    }
  }
  
  .about-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 3rem;
    
    .about-text {
      flex: 1;
      
      h2 {
        font-size: 2.5rem;
        color: var(--lego-black);
        margin-bottom: 2rem;
      }
      
      p {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--lego-dark-grey);
        margin-bottom: 1.5rem;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .about-characters {
      flex: 0 0 auto;
      display: flex;
      gap: 1rem;
      
      .about-character {
        width: 150px;
        height: auto;
        filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

// Loading Section
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--lego-light-grey);
    border-top: 4px solid var(--lego-yellow);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: var(--lego-dark-grey);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    height: auto;
    min-height: 100vh;
    padding: 2rem 0;
    
    .hero-content {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
      
      .hero-character .hero-character-img {
        width: 200px;
      }
      
      .hero-text {
        .hero-title {
          font-size: 2.5rem;
        }
        
        .hero-subtitle {
          font-size: 1.1rem;
        }
        
        .hero-buttons {
          justify-content: center;
          
          .hero-btn {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }
        }
      }
    }
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .stats-section .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
  }
  
  .tournaments-grid {
    grid-template-columns: 1fr;
  }
  
  .about-content {
    flex-direction: column;
    text-align: center;
    
    .about-text h2 {
      font-size: 2rem;
    }
    
    .about-characters {
      justify-content: center;
      
      .about-character {
        width: 120px;
      }
    }
  }
}
</style>
