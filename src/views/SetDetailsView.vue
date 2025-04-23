<template>
  <div class="set-details" v-if="set">
    <div class="set-main">
      <div class="set-image">
        <img
          :src="
            set.face_photo && set.face_photo.photo_url
              ? set.face_photo.photo_url
              : defaultSetImage
          "
          :alt="set.name"
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

    <div v-if="set && set.photos && set.photos.length > 0" class="set-photos">
      <h2>Галерея</h2>

      <div class="photos-grid">
        <div
          v-for="photo in set.photos"
          :key="photo.photo_id"
          class="photo-item"
        >
          <img :src="photo.photo_url" :alt="set.name" />
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
  name: "SetDetailsView",
  data() {
    return {
      set: null,
      loading: true,
      error: null,
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
  },
  methods: {
    ...mapActions(["fetchSetById"]),
    formatPrice(price) {
      return new Intl.NumberFormat("ru-RU").format(price);
    },
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
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.set-image {
  flex: 1;
  min-width: 300px;

  img {
    width: 100%;
    height: auto;
    border-radius: var(--lego-border-radius);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}

.set-info {
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

.set-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .set-meta-item {
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

.set-minifigures,
.set-photos {
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
