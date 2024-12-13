<script setup>
import ChatBot from './components/ChatBot.vue'
</script>

<template>
  <div class="tarot-app">
    <h1 class="tarot-app__title">🔮 Таро-предсказания</h1>
    <ChatBot />
  </div>
</template>

<style scoped>
.tarot-app {
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background-color: #000000;
}

.tarot-app__title {
  margin-bottom: 2rem;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  text-align: center;
  font-size: 2.5rem;
}
</style>
