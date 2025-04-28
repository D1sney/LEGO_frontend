<template>
  <div class="set-details-container">
    <div v-if="loading" class="loading-indicator">
      <p>Загрузка данных о наборе...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-button">Повторить загрузку</button>
    </div>
    
    <div class="set-details" v-else-if="set">
      <div class="set-main">
        <div class="set-images">
          <PhotoGallery 
            :photos="photoUrls" 
            :altText="set.name"
            aspectRatio="16:9"
          />
        </div>

        <div class="set-info">
          <h1>{{ set.name }}</h1>

          <div class="set-meta">
            <div class="set-meta-item">
              <span class="label">ID набора:</span>
              <span class="value">{{ set.set_id }}</span>
            </div>
            <div class="set-meta-item">
              <span class="label">Тема:</span>
              <span class="value">{{ set.theme }}</span>
            </div>
            <div class="set-meta-item" v-if="set.sub_theme">
              <span class="label">Подтема:</span>
              <span class="value">{{ set.sub_theme }}</span>
            </div>
            <div class="set-meta-item">
              <span class="label">Год выпуска:</span>
              <span class="value">{{ set.release_year }}</span>
            </div>
            <div class="set-meta-item">
              <span class="label">Количество деталей:</span>
              <span class="value">{{ set.piece_count }}</span>
            </div>
            <div class="set-meta-item">
              <span class="label">Цена:</span>
              <span class="value price">{{ formatPrice(set.price) }} ₽</span>
            </div>
          </div>

          <div class="set-tags" v-if="set.tags && set.tags.length > 0">
            <h3>Теги:</h3>
            <div class="tag-list">
              <span class="tag" v-for="tag in set.tags" :key="tag.tag_id">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="set && set.minifigures && set.minifigures.length > 0"
        class="set-minifigures"
      >
        <h2>Минифигурки в наборе</h2>

        <div class="minifigures-grid">
          <div
            v-for="figure in set.minifigures"
            :key="figure.minifigure_id"
            class="figure-card"
          >
            <div class="figure-card-image">
              <img
                :src="
                  figure.face_photo && figure.face_photo.photo_url
                    ? figure.face_photo.photo_url
                    : defaultFigureImage
                "
                :alt="figure.name"
              />
            </div>
            <div class="figure-card-content">
              <h3>{{ figure.name }}</h3>
              <p><strong>Персонаж:</strong> {{ figure.character_name }}</p>
              <div v-if="figure.price" class="figure-card-price">
                {{ formatPrice(figure.price) }} ₽
              </div>
              <router-link
                :to="`/minifigures/${figure.minifigure_id}`"
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
      <p>Информация о наборе не найдена</p>
      <router-link to="/" class="back-link">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import PhotoGallery from "@/components/PhotoGallery.vue";

export default {
  name: "SetDetailsView",
  components: {
    PhotoGallery
  },
  data() {
    return {
      defaultSetImage: require("@/assets/images/default-set.png"),
      defaultFigureImage: require("@/assets/images/default-figure.png")
    };
  },
  computed: {
    ...mapGetters({
      set: "getCurrentSet",
      loading: "isLoading",
      error: "getError",
    }),
    photoUrls() {
      if (!this.set) return [];
      
      // Если есть фотографии, создаем массив URL из всех фото
      if (this.set.photos && this.set.photos.length > 0) {
        return this.set.photos.map(photo => photo.photo_url);
      }
      
      // Если есть только основное фото
      if (this.set.face_photo && this.set.face_photo.photo_url) {
        return [this.set.face_photo.photo_url];
      }
      
      // Если фотографий нет, возвращаем дефолтное изображение
      return [this.defaultSetImage];
    }
  },
  methods: {
    ...mapActions(["fetchSetById"]),
    formatPrice(price) {
      return new Intl.NumberFormat("ru-RU").format(price);
    },
    async retryFetch() {
      try {
        await this.fetchSetById(this.$route.params.id);
      } catch (error) {
        console.error("Error while retrying to fetch set data:", error);
      }
    }
  },
  async mounted() {
    try {
      await this.fetchSetById(this.$route.params.id);
    } catch (error) {
      console.error("Error while fetching set data:", error);
    }
  },
};
</script>

<style lang="scss" scoped>
.set-details-container {
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

.set-details {
  animation: fadeIn 0.3s ease-in-out;
}

.set-main {
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

.set-images {
  flex: 1;
  min-width: 380px;
}

.set-info {
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

.set-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  .set-meta-item {
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

.set-tags {
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

.set-minifigures {
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

.minifigures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.figure-card {
  background-color: white;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .figure-card-image {
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .figure-card-content {
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
    
    .figure-card-price {
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
