<template>
  <div class="photo-gallery">
    <div class="gallery-main">
      <div class="main-photo-container">
        <div class="main-photo-wrapper">
          <img :src="currentPhoto" :alt="altText" class="main-photo" />
        </div>
        
        <button 
          v-if="photos.length > 1" 
          @click="prevPhoto" 
          class="gallery-nav prev-button"
        >
          <span class="nav-icon">❮</span>
        </button>
        
        <button 
          v-if="photos.length > 1" 
          @click="nextPhoto" 
          class="gallery-nav next-button"
        >
          <span class="nav-icon">❯</span>
        </button>
      </div>
    </div>
    
    <div v-if="photos.length > 1" class="gallery-thumbnails">
      <div 
        v-for="(photo, index) in photos" 
        :key="index"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="setCurrentPhoto(index)"
      >
        <img :src="photo" :alt="`${altText} - фото ${index + 1}`" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoGallery',
  props: {
    photos: {
      type: Array,
      required: true
    },
    altText: {
      type: String,
      default: 'LEGO'
    },
    aspectRatio: {
      type: String,
      default: '4:3' // Соотношение сторон по умолчанию
    }
  },
  data() {
    return {
      currentIndex: 0
    };
  },
  computed: {
    currentPhoto() {
      return this.photos.length > 0 ? this.photos[this.currentIndex] : '';
    },
    getAspectRatioPadding() {
      // Разбиваем строку соотношения на части
      const [width, height] = this.aspectRatio.split(':').map(Number);
      
      // Вычисляем процент заполнения по высоте
      if (width && height) {
        return `${(height / width) * 100}%`;
      }
      
      // Если не удалось разобрать соотношение, используем 4:3 (75%)
      return '75%';
    }
  },
  mounted() {
    // Добавляем обработчик нажатия клавиш для навигации
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    // Удаляем обработчик при уничтожении компонента
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    prevPhoto() {
      if (this.photos.length <= 1) return;
      
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        // Переход к последней фотографии, если текущая - первая
        this.currentIndex = this.photos.length - 1;
      }
    },
    nextPhoto() {
      if (this.photos.length <= 1) return;
      
      if (this.currentIndex < this.photos.length - 1) {
        this.currentIndex++;
      } else {
        // Переход к первой фотографии, если текущая - последняя
        this.currentIndex = 0;
      }
    },
    setCurrentPhoto(index) {
      this.currentIndex = index;
    },
    handleKeyDown(event) {
      // Обработка нажатия клавиш стрелок
      if (event.key === 'ArrowLeft') {
        this.prevPhoto();
      } else if (event.key === 'ArrowRight') {
        this.nextPhoto();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.photo-gallery {
  margin-bottom: 2.5rem;
}

.gallery-main {
  margin-bottom: 1.5rem;
}

.main-photo-container {
  position: relative;
  border-radius: var(--lego-border-radius);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.main-photo-wrapper {
  position: relative;
  width: 100%;
  padding-top: v-bind('getAspectRatioPadding');
  min-height: 400px;
  overflow: hidden;
  
  .main-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #f8f8f8;
  }
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
  z-index: 2;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .nav-icon {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--lego-black);
  }
}

.prev-button {
  left: 15px;
}

.next-button {
  right: 15px;
}

.gallery-thumbnails {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  .thumbnail {
    width: 100px;
    height: 100px;
    border-radius: var(--lego-border-radius);
    overflow: hidden;
    cursor: pointer;
    border: 3px solid transparent;
    transition: transform 0.3s, border-color 0.3s;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    }
    
    &.active {
      border-color: var(--lego-yellow);
      transform: translateY(-3px);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

@media (max-width: 768px) {
  .gallery-thumbnails .thumbnail {
    width: 80px;
    height: 80px;
  }
}
</style> 