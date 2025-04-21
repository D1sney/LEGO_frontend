<template>
  <div class="set-card" @click="navigateToDetails">
    <div class="set-card-image">
      <img :src="imageUrl" :alt="set.name" />
    </div>
    <div class="set-card-content">
      <h3>{{ set.name }}</h3>
      <div class="set-card-details">
        <p><strong>Тема:</strong> {{ set.theme }}</p>
        <p><strong>Год:</strong> {{ set.release_year }}</p>
        <p><strong>Деталей:</strong> {{ set.piece_count }}</p>
      </div>
      <div class="set-card-price">
        {{ formattedPrice }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SetCard",
  props: {
    set: {
      type: Object,
      required: true,
    },
  },
  computed: {
    imageUrl() {
      return this.set.face_photo && this.set.face_photo.photo_url
        ? this.set.face_photo.photo_url
        : require("@/assets/default-set.jpg");
    },
    formattedPrice() {
      return new Intl.NumberFormat("ru-RU").format(this.set.price) + " ₽";
    },
  },
  methods: {
    navigateToDetails() {
      this.$router.push(`/sets/${this.set.set_id}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.set-card {
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

  .set-card-image {
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

  .set-card-content {
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

    .set-card-details {
      flex: 1;

      p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--lego-dark-gray);
      }
    }

    .set-card-price {
      font-weight: bold;
      font-size: 1.2rem;
      text-align: right;
      color: var(--lego-red);
      margin-top: 1rem;
    }
  }
}
</style>
