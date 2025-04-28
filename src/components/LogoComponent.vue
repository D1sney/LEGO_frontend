<template>
  <div class="lego-logo-component" :style="{ height: height + 'px' }">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
      <g>
        <rect width="100%" height="100%" fill="#FFD500"/>
        <path d="M122 175h58a20 20 0 0 1 20 20v149a20 20 0 0 1-20 20h-58a20 20 0 0 1-20-20V195a20 20 0 0 1 20-20zm107 0h58a20 20 0 0 1 20 20v149a20 20 0 0 1-20 20h-58a20 20 0 0 1-20-20V195a20 20 0 0 1 20-20zm107 0h58a20 20 0 0 1 20 20v80a20 20 0 0 1-20 20h-58a20 20 0 0 1-20-20v-80a20 20 0 0 1 20-20z" fill="#D01012"/>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'LogoComponent',
  props: {
    height: {
      type: Number,
      default: 40
    }
  }
}
</script>

<style scoped>
.lego-logo-component {
  display: inline-block;
}
</style> 