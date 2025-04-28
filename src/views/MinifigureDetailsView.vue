<template>
  <div class="minifigure-details-container">
    <div v-if="loading" class="loading-indicator">
      <p>Загрузка данных о минифигурке...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-button">Повторить загрузку</button>
    </div>
    
    <div class="minifigure-details" v-else-if="minifigure">
      <div class="minifigure-main">
        <div class="minifigure-images">
          <PhotoGallery 
            :photos="photoUrls" 
            :altText="minifigure.name"
            aspectRatio="1:1"
          />
        </div>

        <div class="minifigure-info">
          <h1>{{ minifigure.name }}</h1>

          <div class="minifigure-meta">
            <div class="minifigure-meta-item">
              <span class="label">ID минифигурки:</span>
              <span class="value">{{ minifigure.minifigure_id }}</span>
            </div>
            <div class="minifigure-meta-item">
              <span class="label">Персонаж:</span>
              <span class="value">{{ minifigure.character_name }}</span>
            </div>
            <div class="minifigure-meta-item" v-if="minifigure.variant">
              <span class="label">Вариант:</span>
              <span class="value">{{ minifigure.variant }}</span>
            </div>
            <div class="minifigure-meta-item">
              <span class="label">Год выпуска:</span>
              <span class="value">{{ minifigure.release_year }}</span>
            </div>
            <div class="minifigure-meta-item" v-if="minifigure.price">
              <span class="label">Цена:</span>
              <span class="value price">{{ formatPrice(minifigure.price) }} ₽</span>
            </div>
          </div>

          <div class="minifigure-tags" v-if="minifigure.tags && minifigure.tags.length > 0">
            <h3>Теги:</h3>
            <div class="tag-list">
              <span class="tag" v-for="tag in minifigure.tags" :key="tag.tag_id">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="minifigure && minifigure.sets && minifigure.sets.length > 0"
        class="minifigure-sets"
      >
        <h2>Наборы с этой минифигуркой</h2>

        <div class="sets-grid">
          <div
            v-for="set in minifigure.sets"
            :key="set.set_id"
            class="set-card"
          >
            <div class="set-card-image">
              <img
                :src="
                  set.face_photo && set.face_photo.photo_url
                    ? set.face_photo.photo_url
                    : defaultSetImage
                "
                :alt="set.name"
              />
            </div>
            <div class="set-card-content">
              <h3>{{ set.name }}</h3>
              <p><strong>Тема:</strong> {{ set.theme }}</p>
              <p><strong>Год:</strong> {{ set.release_year }}</p>
              <div v-if="set.price" class="set-card-price">
                {{ formatPrice(set.price) }} ₽
              </div>
              <router-link
                :to="`/sets/${set.set_id}`"
                class="view-details"
              >
                Подробнее
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-data">
      <p>Информация о минифигурке не найдена</p>
      <router-link to="/" class="back-link">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import PhotoGallery from "@/components/PhotoGallery.vue";

export default {
  name: "MinifigureDetailsView",
  components: {
    PhotoGallery
  },
  data() {
    return {
      minifigure: null,
      loading: true,
      error: null,
      defaultSetImage: require("@/assets/images/default-set.png"),
      defaultFigureImage: require("@/assets/images/default-figure.png")
    };
  },
  computed: {
    ...mapGetters({
      minifigure: "getCurrentMinifigure",
      loading: "isLoading",
      error: "getError",
    }),
    photoUrls() {
      if (!this.minifigure) return [];
      
      // Если есть фотографии, создаем массив URL из всех фото
      if (this.minifigure.photos && this.minifigure.photos.length > 0) {
        return this.minifigure.photos.map(photo => photo.photo_url);
      }
      
      // Если есть только основное фото
      if (this.minifigure.face_photo && this.minifigure.face_photo.photo_url) {
        return [this.minifigure.face_photo.photo_url];
      }
      
      // Если фотографий нет, возвращаем дефолтное изображение
      return [this.defaultFigureImage];
    }
  },
  methods: {
    ...mapActions(["fetchMinifigureById"]),
    formatPrice(price) {
      return new Intl.NumberFormat("ru-RU").format(price);
    },
    async retryFetch() {
      try {
        await this.fetchMinifigureById(this.$route.params.id);
      } catch (error) {
        console.error("Error while retrying to fetch minifigure data:", error);
      }
    }
  },
  async mounted() {
    try {
      await this.fetchMinifigureById(this.$route.params.id);
    } catch (error) {
      console.error("Error while fetching minifigure data:", error);
    }
  },
};
</script>

<style lang="scss" scoped>
.minifigure-details-container {
  min-height: 300px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-indicator, 
.error-message,
.no-data {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: var(--lego-border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;

  p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
}

.loading-indicator p {
  color: var(--lego-blue);
  font-weight: bold;
}

.error-message p {
  color: var(--lego-red);
}

.retry-button, 
.back-link {
  display: inline-block;
  background-color: var(--lego-blue);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--lego-border-radius);
  border: none;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: darken(#006cb7, 10%);
  }
}

.minifigure-details {
  animation: fadeIn 0.3s ease-in-out;
}

.minifigure-main {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: var(--lego-border-radius);
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.minifigure-images {
  flex: 1;
  min-width: 380px;
}

.minifigure-info {
  flex: 1;
  min-width: 380px;

  h1 {
    color: var(--lego-blue);
    font-size: 2.5rem;
    margin-bottom: 1.8rem;

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
}

.minifigure-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  .minifigure-meta-item {
    display: flex;
    flex-direction: column;

    .label {
      font-weight: bold;
      font-size: 1rem;
      color: var(--lego-dark-gray);
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1.3rem;

      &.price {
        color: var(--lego-red);
        font-weight: bold;
        font-size: 1.5rem;
      }
    }
  }
}

.minifigure-tags {
  margin-top: 1.5rem;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .tag {
      background-color: var(--lego-yellow);
      color: var(--lego-black);
      padding: 0.3rem 0.8rem;
      border-radius: 50px;
      font-size: 0.9rem;
    }
  }
}

.minifigure-sets {
  margin-top: 3rem;

  h2 {
    font-size: 1.5rem;
    color: var(--lego-blue);
    margin-bottom: 1.5rem;
    position: relative;

    &:after {
      content: "";
      display: block;
      width: 50px;
      height: 4px;
      background-color: var(--lego-yellow);
      margin-top: 0.5rem;
    }
  }
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.set-card {
  background-color: white;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .set-card-image {
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .set-card-content {
    padding: 1rem;

    h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: var(--lego-black);
    }

    p {
      font-size: 0.9rem;
      margin-bottom: 0.8rem;
      color: var(--lego-dark-gray);
    }
    
    .set-card-price {
      font-size: 0.9rem;
      color: var(--lego-red);
      font-weight: bold;
    }

    .view-details {
      display: inline-block;
      color: var(--lego-blue);
      font-weight: bold;
      text-decoration: none;
      font-size: 0.9rem;
      margin-top: 0.5rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
