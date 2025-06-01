<template>
  <div id="app" class="lego-app">
    <header class="lego-header">
      <div class="lego-logo">
        <img src="@/assets/images/logo-collector.png" alt="LEGO Collector Logo">
        <h1>Моя коллекция LEGO</h1>
      </div>

      <div class="header-controls">
        <nav class="main-nav">
          <router-link to="/" class="nav-link">Главная</router-link>
          <router-link to="/collection" class="nav-link">Коллекция</router-link>
          <router-link to="/tournaments" class="nav-link">Турниры</router-link>
        </nav>
        
        <div class="search-container">
          <button @click="toggleSearch" class="search-button">
            <span v-if="!searchOpen">Поиск</span>
            <span v-else>Закрыть</span>
          </button>
        </div>
        
        <UserMenu />
      </div>
    </header>

    <div class="search-panel" :class="{ 'search-panel-open': searchOpen }">
      <div class="search-filters">
        <div class="filter-section">
          <TagFilter 
            title="Коллекции" 
            :tags="availableTags" 
            :selectedTags="selectedTags"
            @toggle-tag="toggleTag"
          />
        </div>

        <div class="filter-section">
          <h3>Поиск</h3>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Введите название или описание"
            class="search-input"
          />
        </div>

        <div class="filter-section">
          <h3>Год выпуска</h3>
          <select v-model="yearFilter">
            <option value="">Все года</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div class="filter-section">
          <h3>Цена</h3>
          <div class="price-range">
            <input 
              type="number" 
              v-model="minPrice" 
              placeholder="Мин. цена" 
              class="price-input"
            />
            <span class="price-separator">-</span>
            <input 
              type="number" 
              v-model="maxPrice" 
              placeholder="Макс. цена" 
              class="price-input"
            />
          </div>
        </div>

        <div class="filter-section">
          <h3>Количество деталей</h3>
          <div class="piece-range">
            <input 
              type="number" 
              v-model="minPieceCount" 
              placeholder="Мин. кол-во" 
              class="piece-input"
            />
            <span class="piece-separator">-</span>
            <input 
              type="number" 
              v-model="maxPieceCount" 
              placeholder="Макс. кол-во" 
              class="piece-input"
            />
          </div>
        </div>

        <div class="filter-section">
          <h3>Тип</h3>
          <div class="type-selector">
            <button
              :class="{ active: collectionType === 'sets' }"
              @click="collectionType = 'sets'"
            >
              Наборы
            </button>
            <button
              :class="{ active: collectionType === 'minifigures' }"
              @click="collectionType = 'minifigures'"
            >
              Минифигурки
            </button>
          </div>
        </div>

        <button @click="applyFilters" class="apply-button">
          Применить фильтры
        </button>
      </div>
    </div>

    <main class="lego-content">
      <router-view />
    </main>

    <footer class="lego-footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-logo">
            <img src="@/assets/images/logo-collector.png" alt="LEGO Collector Logo">
            <h3>LEGO Collector</h3>
          </div>
          <p class="footer-description">
            Ваша персональная платформа для управления коллекцией LEGO наборов и минифигурок
          </p>
        </div>
        
        <div class="footer-section">
          <h4>Навигация</h4>
          <ul class="footer-links">
            <li><router-link to="/">Главная</router-link></li>
            <li><router-link to="/collection">Коллекция</router-link></li>
            <li><router-link to="/collection?type=sets">Наборы</router-link></li>
            <li><router-link to="/collection?type=minifigures">Минифигурки</router-link></li>
            <li><router-link to="/tournaments">Турниры</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Информация</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent>О проекте</a></li>
            <li><a href="#" @click.prevent>Контакты</a></li>
            <li><a href="#" @click.prevent>Помощь</a></li>
            <li><a href="#" @click.prevent>API</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Статистика</h4>
          <div class="footer-stats">
            <div class="footer-stat">
              <i class="fas fa-cubes"></i>
              <span>Наборы в коллекции</span>
            </div>
            <div class="footer-stat">
              <i class="fas fa-users"></i>
              <span>Минифигурки</span>
            </div>
            <div class="footer-stat">
              <img src="@/assets/images/trophy.png" alt="Trophy" class="footer-trophy">
              <span>Турниры</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-decorations">
          <div class="lego-brick red"></div>
          <div class="lego-brick yellow"></div>
          <div class="lego-brick blue"></div>
          <div class="lego-brick green"></div>
        </div>
        
        <div class="footer-copyright">
          <p>© {{ new Date().getFullYear() }} LEGO Collector. Создано с ❤️ для любителей LEGO</p>
          <p class="footer-disclaimer">
            LEGO® является торговой маркой группы компаний LEGO. Данный сайт не связан с LEGO Group.
          </p>
        </div>
        
        <div class="footer-decorations">
          <div class="lego-brick green"></div>
          <div class="lego-brick blue"></div>
          <div class="lego-brick yellow"></div>
          <div class="lego-brick red"></div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import TagFilter from './components/TagFilter.vue';
import UserMenu from './components/UserMenu.vue';

export default {
  name: "App",
  components: {
    TagFilter,
    UserMenu
  },
  data() {
    return {
      searchOpen: false,
      selectedTags: [],
      yearFilter: "",
      collectionType: "sets",
      availableTags: [],
      searchQuery: "",
      minPrice: "",
      maxPrice: "",
      minPieceCount: "",
      maxPieceCount: "",
      years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]
    };
  },
  methods: {
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (this.searchOpen && this.availableTags.length === 0) {
        this.fetchTags();
      }
    },
    toggleTag(tagId) {
      if (this.selectedTags.includes(tagId)) {
        this.selectedTags = this.selectedTags.filter((id) => id !== tagId);
      } else {
        this.selectedTags.push(tagId);
      }
    },
    async fetchTags() {
      try {
        const response = await axios.get('/tags/');
        console.log("Теги получены:", response.data);
        if (Array.isArray(response.data)) {
          this.availableTags = response.data;
        } else {
          console.error("Неверный формат ответа API при получении тегов:", response.data);
          this.availableTags = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке тегов:", error);
        this.availableTags = [];
        
        // Проверяем, связана ли ошибка с авторизацией
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Перенаправляем на страницу входа, если пользователь не авторизован
          this.$store.commit('LOGOUT');
          this.$router.push('/login');
          this.searchOpen = false;
        }
      }
    },
    applyFilters() {
      const query = {
        type: this.collectionType
      };
      
      if (this.selectedTags.length > 0) {
        // Преобразуем ID тегов в их имена
        const tagNames = this.selectedTags.map(tagId => {
          const tag = this.availableTags.find(t => t.tag_id === tagId);
          return tag ? tag.name : null;
        }).filter(name => name !== null).join(',');
        
        if (tagNames) {
          query.tag_names = tagNames;
          query.tag_logic = "AND";
        }
      }
      
      if (this.yearFilter) {
        query.year = this.yearFilter;
      }
      
      if (this.searchQuery) {
        query.search = this.searchQuery;
      }
      
      if (this.minPrice) {
        query.min_price = this.minPrice;
      }
      
      if (this.maxPrice) {
        query.max_price = this.maxPrice;
      }
      
      if (this.minPieceCount) {
        query.min_piece_count = this.minPieceCount;
      }
      
      if (this.maxPieceCount) {
        query.max_piece_count = this.maxPieceCount;
      }
      
      this.$router.push({
        name: "home",
        query: query
      });
      
      this.searchOpen = false;
    },
  },
  mounted() {
    // Загружаем теги при первоначальной загрузке
    this.fetchTags();
    
    // Восстанавливаем состояние фильтров из URL при загрузке страницы
    const query = this.$route.query;
    
    if (query.type) {
      this.collectionType = query.type;
    }
    
    if (query.tag_names && this.availableTags.length > 0) {
      const tagNames = query.tag_names.split(',');
      this.selectedTags = this.availableTags
        .filter(tag => tagNames.includes(tag.name))
        .map(tag => tag.tag_id);
    }
    
    if (query.year) {
      this.yearFilter = query.year;
    }
    
    if (query.search) {
      this.searchQuery = query.search;
    }
    
    if (query.min_price) {
      this.minPrice = query.min_price;
    }
    
    if (query.max_price) {
      this.maxPrice = query.max_price;
    }
    
    if (query.min_piece_count) {
      this.minPieceCount = query.min_piece_count;
    }
    
    if (query.max_piece_count) {
      this.maxPieceCount = query.max_piece_count;
    }
  },
  watch: {
    availableTags: {
      handler(newTags) {
        if (newTags.length > 0 && this.$route.query.tag_names) {
          const tagNames = this.$route.query.tag_names.split(',');
          this.selectedTags = newTags
            .filter(tag => tagNames.includes(tag.name))
            .map(tag => tag.tag_id);
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss">
:root {
  --lego-yellow: #ffd500;
  --lego-red: #d01012;
  --lego-blue: #006cb7;
  --lego-black: #1a1a1a;
  --lego-dark-gray: #333333;
  --lego-light-gray: #f5f5f5;
  --lego-border-radius: 4px;
  --transition-speed: 0.3s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Arial", sans-serif;
  background-color: var(--lego-light-gray);
  color: var(--lego-black);
}

.lego-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.lego-header {
  background-color: var(--lego-yellow);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.lego-logo {
  display: flex;
  align-items: center;

  img {
    height: 40px;
    margin-right: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    color: var(--lego-black);

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }

    @media (max-width: 480px) {
      display: none;
    }
  }
}

.search-button {
  background-color: var(--lego-red);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--lego-border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background-color var(--transition-speed);

  &:hover {
    background-color: darken(#d01012, 10%);
  }
}

.search-panel {
  background-color: var(--lego-blue);
  color: white;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-speed),
    padding var(--transition-speed);

  &.search-panel-open {
    max-height: 800px;
    padding: 1rem;
  }
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  .filter-section {
    flex: 1;
    min-width: 200px;

    h3 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    select, input, .search-input {
      width: 100%;
      padding: 0.5rem;
      border-radius: var(--lego-border-radius);
      border: none;
    }
  }
}

.price-range, .piece-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .price-input, .piece-input {
    flex: 1;
    padding: 0.5rem;
    border-radius: var(--lego-border-radius);
    border: none;
  }
  
  .price-separator, .piece-separator {
    font-weight: bold;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .tag {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.6rem;
    border-radius: var(--lego-border-radius);
    cursor: pointer;
    transition: background-color var(--transition-speed);

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &.active {
      background-color: var(--lego-yellow);
      color: var(--lego-black);
    }
  }
}

.type-selector {
  display: flex;
  gap: 0.5rem;

  button {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    padding: 0.5rem;
    color: white;
    border-radius: var(--lego-border-radius);
    cursor: pointer;
    transition: background-color var(--transition-speed);

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &.active {
      background-color: var(--lego-yellow);
      color: var(--lego-black);
    }
  }
}

.apply-button {
  background-color: var(--lego-red);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--lego-border-radius);
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  width: 100%;
  transition: background-color var(--transition-speed);

  &:hover {
    background-color: darken(#d01012, 10%);
  }
}

.lego-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.lego-footer {
  background: linear-gradient(135deg, var(--lego-dark-gray) 0%, #2c3e50 100%);
  color: white;
  margin-top: auto;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    
    .footer-section {
      h4 {
        color: var(--lego-yellow);
        font-size: 1.2rem;
        margin-bottom: 1rem;
        font-weight: bold;
      }
      
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        
        img {
          width: 50px;
          height: 50px;
        }
        
        h3 {
          color: var(--lego-yellow);
          font-size: 1.5rem;
          margin: 0;
        }
      }
      
      .footer-description {
        color: #bdc3c7;
        line-height: 1.6;
        margin-bottom: 0;
      }
      
      .footer-links {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 0.5rem;
          
          a {
            color: #bdc3c7;
            text-decoration: none;
            transition: color 0.3s ease;
            
            &:hover {
              color: var(--lego-yellow);
            }
          }
        }
      }
      
      .footer-stats {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        
        .footer-stat {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #bdc3c7;
          
          i {
            color: var(--lego-yellow);
            font-size: 1.1rem;
            width: 20px;
          }
          
          .footer-trophy {
            width: 20px;
            height: 20px;
          }
          
          span {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
  
  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    
    .footer-decorations {
      display: flex;
      gap: 0.5rem;
      
      .lego-brick {
        width: 20px;
        height: 20px;
        border-radius: 3px;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
        }
        
        &.red {
          background: var(--lego-red);
        }
        
        &.yellow {
          background: var(--lego-yellow);
        }
        
        &.blue {
          background: var(--lego-blue);
        }
        
        &.green {
          background: var(--lego-green);
        }
      }
    }
    
    .footer-copyright {
      text-align: center;
      flex: 1;
      
      p {
        margin: 0;
        color: #bdc3c7;
        
        &:first-child {
          font-size: 1rem;
          margin-bottom: 0.3rem;
        }
        
        &.footer-disclaimer {
          font-size: 0.8rem;
          color: #95a5a6;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      padding: 2rem 1rem 1rem;
      gap: 1.5rem;
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      
      .footer-decorations {
        order: 1;
      }
      
      .footer-copyright {
        order: 2;
      }
    }
  }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .main-nav {
    display: flex;
    gap: 1rem;
    
    .nav-link {
      color: var(--lego-black);
      text-decoration: none;
      font-weight: bold;
      transition: color 0.2s;
      padding: 0.3rem 0.7rem;
      border-radius: var(--lego-border-radius);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      &.router-link-active {
        background-color: var(--lego-yellow);
        color: var(--lego-black);
      }
    }
  }
}
</style>
