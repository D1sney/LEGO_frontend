<template>
  <div class="minifigure-card" @click="navigateToDetails">
    <div class="minifigure-card-image">
      <img :src="imageUrl" :alt="minifigure.name" />
    </div>
    <div class="minifigure-card-content">
      <h3>{{ minifigure.name }}</h3>
      <div class="minifigure-card-details">
        <p><strong>Персонаж:</strong> {{ minifigure.character_name }}</p>
        <p><strong>ID:</strong> {{ minifigure.minifigure_id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MinifigureCard",
  props: {
    minifigure: {
      type: Object,
      required: true,
    },
  },
  computed: {
    imageUrl() {
      return this.minifigure.face_photo && this.minifigure.face_photo.photo_url
        ? this.minifigure.face_photo.photo_url
        : require("@/assets/images/default-figure.png");
    },
  },
  methods: {
    navigateToDetails() {
      this.$router.push(`/minifigures/${this.minifigure.minifigure_id}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.minifigure-card {
  background-color: white;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .minifigure-card-image {
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

  .minifigure-card-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;

    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
      color: var(--lego-black);
      min-height: 2.8rem;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .minifigure-card-details {
      flex: 1;

      p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--lego-dark-gray);
      }
    }
  }
}
</style>
