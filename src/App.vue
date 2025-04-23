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
          <h3>Коллекции</h3>
          <div class="tag-list">
            <span
              class="tag"
              v-for="tag in popularTags"
              :key="tag.id"
              :class="{ active: selectedTags.includes(tag.id) }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </span>
          </div>
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
export default {
  name: "App",
  data() {
    return {
      searchOpen: false,
      selectedTags: [],
      yearFilter: "",
      collectionType: "sets",
      popularTags: [
        { id: 1, name: "Гарри Поттер" },
        { id: 2, name: "Star Wars" },
        { id: 3, name: "Супергерои" },
        { id: 4, name: "Technic" },
        { id: 5, name: "City" },
        { id: 6, name: "Architecture" },
        { id: 7, name: "Friends" },
        { id: 8, name: "Creator" },
      ],
      years: [2023, 2022, 2021, 2020, 2019, 2018],
    };
  },
  methods: {
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
    },
    toggleTag(tagId) {
      if (this.selectedTags.includes(tagId)) {
        this.selectedTags = this.selectedTags.filter((id) => id !== tagId);
      } else {
        this.selectedTags.push(tagId);
      }
    },
    applyFilters() {
      this.$router.push({
        name: "home",
        query: {
          tags: this.selectedTags.join(","),
          year: this.yearFilter,
          type: this.collectionType,
        },
      });
      this.searchOpen = false;
    },
  },
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
    max-height: 500px;
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

    select {
      width: 100%;
      padding: 0.5rem;
      border-radius: var(--lego-border-radius);
      border: none;
    }
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
