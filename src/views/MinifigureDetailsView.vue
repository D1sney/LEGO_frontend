<template>
  <div class="minifigure-details" v-if="minifigure">
    <div class="minifigure-main">
      <div class="minifigure-image">
        <img
          :src="
            minifigure.face_photo && minifigure.face_photo.photo_url
              ? minifigure.face_photo.photo_url
              : defaultFigureImage
          "
          :alt="minifigure.name"
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
          <div class="minifigure-meta-item" v-if="minifigure.price">
            <span class="label">Цена:</span>
            <span class="value price">{{ formatPrice(minifigure.price) }} ₽</span>
          </div>
        </div>

        <div
          class="minifigure-tags"
          v-if="minifigure.tags && minifigure.tags.length > 0"
        >
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
        <div v-for="set in minifigure.sets" :key="set.set_id" class="set-card">
          <div class="set-card-image">
            <img
              :src="set.face_photo && set.face_photo.photo_url ? set.face_photo.photo_url : defaultSetImage"
              :alt="set.name"
            />
          </div>
          <div class="set-card-content">
            <h3>{{ set.name }}</h3>
            <div class="set-card-details">
              <p><strong>Тема:</strong> {{ set.theme }}</p>
              <p><strong>Год:</strong> {{ set.release_year }}</p>
              <p><strong>Деталей:</strong> {{ set.piece_count }}</p>
            </div>
            <div class="set-card-price" v-if="set.price">
              {{ formatPrice(set.price) }} ₽
            </div>
            <router-link :to="`/sets/${set.set_id}`" class="view-details">
              Подробнее
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="minifigure && minifigure.photos && minifigure.photos.length > 0"
      class="minifigure-photos"
    >
      <h2>Галерея</h2>

      <div class="photos-grid">
        <div
          v-for="photo in minifigure.photos"
          :key="photo.photo_id"
          class="photo-item"
        >
          <img :src="photo.photo_url" :alt="minifigure.name" />
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MinifigureDetailsView",
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
  },
  methods: {
    ...mapActions(["fetchMinifigureById"]),
    formatPrice(price) {
      return new Intl.NumberFormat("ru-RU").format(price);
    },
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
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.minifigure-image {
  flex: 1;
  min-width: 250px;
  max-width: 300px;

  img {
    width: 100%;
    height: auto;
    border-radius: var(--lego-border-radius);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}

.minifigure-info {
  flex: 2;

  h1 {
    color: var(--lego-blue);
    font-size: 2rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
}

.minifigure-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .minifigure-meta-item {
    display: flex;
    flex-direction: column;

    .label {
      font-weight: bold;
      font-size: 0.9rem;
      color: var(--lego-dark-gray);
      margin-bottom: 0.3rem;
    }

    .value {
      font-size: 1.1rem;
      
      &.price {
        color: var(--lego-red);
        font-weight: bold;
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

.minifigure-sets,
.minifigure-photos {
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

    .set-card-details {
      margin-bottom: 0.8rem;

      p {
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
        color: var(--lego-dark-gray);
      }
    }

    .set-card-price {
      font-weight: bold;
      font-size: 1.1rem;
      color: var(--lego-red);
      margin-bottom: 0.8rem;
    }

    .view-details {
      display: inline-block;
      color: var(--lego-blue);
      font-weight: bold;
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  .photo-item {
    border-radius: var(--lego-border-radius);
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    aspect-ratio: 1;

    &:hover {
      transform: scale(1.05);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
}

.loading,
.error-message {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: var(--lego-border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  p {
    font-size: 1.2rem;
  }
}

.error-message p {
  color: var(--lego-red);
}
</style>
