<template>
  <div class="home">
    <h2>{{ title }}</h2>

    <div v-if="$route.query.tag_names" class="active-filters">
      <div class="filter-label">Выбранные теги:</div>
      <div class="active-tags">
        <span 
          v-for="(tagName, index) in $route.query.tag_names.split(',')" 
          :key="index" 
          class="active-tag"
        >
          {{ tagName }}
        </span>
      </div>
    </div>

    <div class="collection-section">
      <div v-if="loading" class="loading">
        <p>Загрузка данных...</p>
      </div>

      <div v-else>
        <div v-if="collectionType === 'sets'" class="collection-grid">
          <router-link 
            v-for="set in sets" 
            :key="set.set_id" 
            :to="`/sets/${set.set_id}`" 
            class="lego-card"
          >
            <div class="lego-card-image">
              <img
                :src="
                  set.face_photo && set.face_photo.photo_url 
                  ? set.face_photo.photo_url 
                  : defaultSetImage
                "
                :alt="set.name"
              />
            </div>
            <div class="lego-card-content">
              <h3>{{ set.name }}</h3>
              <div class="lego-card-details">
                <p><strong>Тема:</strong> {{ set.theme }}</p>
                <p><strong>Год:</strong> {{ set.release_year }}</p>
                <p><strong>Деталей:</strong> {{ set.piece_count }}</p>
              </div>
              <div class="lego-card-price">{{ formatPrice(set.price) }} ₽</div>
            </div>
          </router-link>
        </div>

        <div
          v-else-if="collectionType === 'minifigures'"
          class="collection-grid"
        >
          <router-link
            v-for="figure in minifigures"
            :key="figure.minifigure_id"
            :to="`/minifigures/${figure.minifigure_id}`"
            class="lego-card"
          >
            <div class="lego-card-image">
              <img
                :src="
                  figure.face_photo && figure.face_photo.photo_url
                  ? figure.face_photo.photo_url
                  : defaultFigureImage
                "
                :alt="figure.name"
              />
            </div>
            <div class="lego-card-content">
              <h3>{{ figure.name }}</h3>
              <div class="lego-card-details">
                <p><strong>Персонаж:</strong> {{ figure.character_name }}</p>
                <p><strong>ID:</strong> {{ figure.minifigure_id }}</p>
              </div>
              <div v-if="figure.price" class="lego-card-price">
                {{ formatPrice(figure.price) }} ₽
              </div>
            </div>
          </router-link>
        </div>

        <div
          v-if="
            (collectionType === 'sets' && (!sets || sets.length === 0)) ||
            (collectionType === 'minifigures' && (!minifigures || minifigures.length === 0))
          "
          class="no-results"
        >
          <p>По вашему запросу ничего не найдено</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomeView",
  data() {
    return {
      sets: [],
      minifigures: [],
      loading: true,
      title: "Моя коллекция LEGO",
      defaultSetImage: require("@/assets/images/default-set.png"),
      defaultFigureImage: require("@/assets/images/default-figure.png"),
      apiBaseUrl: "/api",
      tags: [],
    };
  },
  computed: {
    collectionType() {
      return this.$route.query.type || "sets";
    },
    selectedTags() {
      const tagNames = this.$route.query.tag_names;
      return tagNames ? tagNames.split(",") : [];
    },
    yearFilter() {
      return this.$route.query.year || "";
    },
  },
  watch: {
    "$route.query": {
      handler() {
        this.fetchData();
      },
      deep: true,
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;

      try {
        // Загружаем теги, если они еще не загружены
        if (this.tags.length === 0) {
          await this.fetchTags();
        }
        
        if (this.collectionType === "sets") {
          await this.fetchSets();
        } else {
          await this.fetchMinifigures();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSets() {
      try {
        // Формируем параметры запроса на основе фильтров
        const params = {};
        
        // Добавляем лимит по умолчанию
        params.limit = 10;
        
        // Добавляем поисковый запрос, если он есть
        if (this.$route.query.search) {
          params.search = this.$route.query.search;
        }
        
        // Добавляем теги и логику объединения
        if (this.$route.query.tag_names) {
          params.tag_names = this.$route.query.tag_names;
          params.tag_logic = 'AND';
        }
        
        // Добавляем год выпуска
        if (this.$route.query.year) {
          params.year = this.$route.query.year;
        }
        
        // Добавляем диапазон цен
        if (this.$route.query.min_price) {
          params.min_price = this.$route.query.min_price;
        }
        if (this.$route.query.max_price) {
          params.max_price = this.$route.query.max_price;
        }
        
        // Добавляем диапазон количества деталей
        if (this.$route.query.min_piece_count) {
          params.min_piece_count = this.$route.query.min_piece_count;
        }
        if (this.$route.query.max_piece_count) {
          params.max_piece_count = this.$route.query.max_piece_count;
        }
        
        // Выполняем запрос к API с параметрами
        const response = await axios.get(`${this.apiBaseUrl}/sets/`, { params });
        console.log("API Response (sets):", response.data);
        
        // Проверка структуры данных
        if (Array.isArray(response.data)) {
          this.sets = response.data;
        } else {
          console.error("Unexpected API response format for sets:", response.data);
          this.sets = [];
        }
        
        this.title = "Наборы LEGO";
      } catch (error) {
        console.error("Error fetching sets:", error);
        this.sets = [];
      }
    },
    async fetchMinifigures() {
      try {
        // Создаем объект параметров запроса
        const params = {};
        
        // Добавляем поисковый запрос, если он указан
        if (this.$route.query.search) {
          params.search = this.$route.query.search;
        }
        
        // Добавляем теги, если они указаны
        if (this.$route.query.tag_names) {
          params.tag_names = this.$route.query.tag_names;
          params.tag_logic = 'AND';
        }
        
        // Добавляем год выпуска
        if (this.$route.query.year) {
          params.year = this.$route.query.year;
        }
        
        // Добавляем диапазон цен
        if (this.$route.query.min_price) {
          params.min_price = this.$route.query.min_price;
        }
        if (this.$route.query.max_price) {
          params.max_price = this.$route.query.max_price;
        }
        
        // Выполняем запрос к API с параметрами
        console.log('Запрос минифигурок с параметрами:', params);
        const response = await axios.get(`${this.apiBaseUrl}/minifigures/`, { params });
        console.log("API Response (minifigures):", response.data);
        
        // Проверка структуры данных
        if (Array.isArray(response.data)) {
          this.minifigures = response.data;
          console.log('Количество загруженных минифигурок:', this.minifigures.length);
          if (this.minifigures.length > 0) {
            console.log('Пример первой минифигурки:', this.minifigures[0]);
          }
        } else {
          console.error("Unexpected API response format for minifigures:", response.data);
          this.minifigures = [];
        }
        
        this.title = "Минифигурки LEGO";
      } catch (error) {
        console.error("Error fetching minifigures:", error);
        this.minifigures = [];
      }
    },
    async fetchTags() {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/tags/`);
        if (Array.isArray(response.data)) {
          this.tags = response.data;
        } else {
          console.error("Unexpected API response format for tags:", response.data);
          this.tags = [];
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        this.tags = [];
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat("ru-RU").format(price);
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
.home {
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--lego-blue);
    font-size: 2rem;
  }
}

.collection-section {
  margin-top: 1rem;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.lego-card {
  background-color: white;
  border-radius: var(--lego-border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .lego-card-image {
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .lego-card-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;

    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
      color: var(--lego-black);
      min-height: 2.8rem;
    }

    .lego-card-details {
      flex: 1;

      p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--lego-dark-gray);
      }
    }

    .lego-card-price {
      font-weight: bold;
      font-size: 1.2rem;
      text-align: right;
      color: var(--lego-red);
      margin-top: 1rem;
    }
  }
}

.loading,
.no-results {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: var(--lego-border-radius);

  p {
    font-size: 1.2rem;
    color: var(--lego-dark-gray);
  }
}

.active-filters {
  background-color: white;
  padding: 1rem;
  border-radius: var(--lego-border-radius);
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .filter-label {
    font-weight: bold;
    color: var(--lego-dark-gray);
  }
  
  .active-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .active-tag {
    background-color: var(--lego-yellow);
    color: var(--lego-black);
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: bold;
  }
}
</style>
