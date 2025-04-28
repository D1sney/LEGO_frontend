<template>
  <div id="app" class="lego-app">
    <header class="lego-header">
      <div class="lego-logo">
        <img src="@/assets/logo.png" alt="LEGO Collection" />
        <h1>Моя коллекция LEGO</h1>
      </div>

      <div class="search-container">
        <button @click="toggleSearch" class="search-button">
          <span v-if="!searchOpen">Поиск</span>
          <span v-else>Закрыть</span>
        </button>
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
      <p>© {{ new Date().getFullYear() }} Моя коллекция LEGO</p>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import TagFilter from './components/TagFilter.vue';

export default {
  name: "App",
  components: {
    TagFilter
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
      years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
      apiBaseUrl: "/api",
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
        const response = await axios.get(`${this.apiBaseUrl}/tags/`);
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
  background-color: var(--lego-dark-gray);
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>
