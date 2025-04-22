<template>
  <div class="home">
    <h2>{{ title }}</h2>

    <div class="collection-section">
      <div v-if="loading" class="loading">
        <p>Загрузка данных...</p>
      </div>

      <div v-else>
        <div v-if="collectionType === 'sets'" class="collection-grid">
          <div v-for="set in sets" :key="set.set_id" class="lego-card">
            <div class="lego-card-image">
              <img
                :src="
                  set.face_photo ? set.face_photo.photo_url : defaultSetImage
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
          </div>
        </div>

        <div
          v-else-if="collectionType === 'minifigures'"
          class="collection-grid"
        >
          <div
            v-for="figure in minifigures"
            :key="figure.minifigure_id"
            class="lego-card"
          >
            <div class="lego-card-image">
              <img
                :src="
                  figure.face_photo
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
            </div>
          </div>
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
    };
  },
  computed: {
    collectionType() {
      return this.$route.query.type || "sets";
    },
    selectedTags() {
      const tags = this.$route.query.tags;
      return tags ? tags.split(",").map(Number) : [];
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
        // В реальном приложении здесь будут учитываться фильтры
        const response = await axios.get(`${this.apiBaseUrl}/sets/?limit=5`);
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
        // В реальном приложении здесь будут учитываться фильтры
        const response = await axios.get(
          `${this.apiBaseUrl}/minifigures/?limit=5`
        );
        console.log("API Response (minifigures):", response.data);
        
        // Проверка структуры данных
        if (Array.isArray(response.data)) {
          this.minifigures = response.data;
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
</style>
