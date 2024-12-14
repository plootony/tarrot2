<script setup>
import { onMounted } from 'vue'
import ChatBot from './components/ChatBot.vue'
import { APP_VERSION, BUILD_DATE } from './config/version'

onMounted(() => {
  console.log(`🔮 Tarot App Version: ${APP_VERSION}`)
  console.log(`📅 Build Date: ${BUILD_DATE}`)
  console.log('🌐 Environment:', import.meta.env.MODE)
})
</script>

<template>
  <div class="app">
    <ChatBot />
  </div>
</template>
