<template>
  <div class="tag-filter">
    <h3>{{ title }}</h3>
    <div class="tag-list">
      <span
        class="tag"
        v-for="tag in tags"
        :key="tag.tag_id"
        :class="{ active: selectedTags.includes(tag.tag_id) }"
        @click="toggleTag(tag.tag_id)"
      >
        {{ tag.name }}
      </span>
    </div>
    <div v-if="tags.length === 0" class="no-tags">
      Теги загружаются...
    </div>
  </div>
</template>

<script>
export default {
  name: "TagFilter",
  props: {
    title: {
      type: String,
      default: "Теги"
    },
    tags: {
      type: Array,
      required: true
    },
    selectedTags: {
      type: Array,
      required: true
    }
  },
  methods: {
    toggleTag(tagId) {
      this.$emit('toggle-tag', tagId);
    }
  }
};
</script>

<style lang="scss" scoped>
.tag-filter {
  margin-bottom: 1rem;
  
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;

  .tag {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.6rem;
    border-radius: var(--lego-border-radius);
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 0.9rem;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &.active {
      background-color: var(--lego-yellow);
      color: var(--lego-black);
      font-weight: bold;
    }
  }
}

.no-tags {
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}
</style> 