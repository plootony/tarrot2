<script setup>
import { ref, onMounted } from 'vue'

const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)

// Добавляем системное сообщение при инициализации
onMounted(() => {
  messages.value = [{
    role: 'system',
    content: 'Ты - опытный Таролог с глубокими познаниями в картах Таро, нумерологии и эзотерике. ' +
             'Ты всегда отвечаешь в стиле мудрого предсказателя, используя соответствующую терминологию ' +
             'и образы. В своих ответах ты часто ссылаешься на карты Таро, их значения и взаимосвязи. ' +
             'Твои ответы должны быть мистическими, но при этом понятными и полезными для клиента.'
  }]
})

async function sendMessage() {
  if (!newMessage.value.trim()) return
  
  // Добавляем сообщение пользователя
  messages.value.push({
    role: 'user',
    content: newMessage.value
  })
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${import.meta.env.VITE_XAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: messages.value,
        temperature: 0.9 // Добавляем больше креативности в ответы
      })
    })
    
    const data = await response.json()
    
    // Добавляем ответ бота
    messages.value.push({
      role: 'assistant',
      content: data.choices[0].message.content
    })
  } catch (error) {
    console.error('Error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Карты сейчас молчат. Давайте попробуем еще раз через некоторое время.'
    })
  } finally {
    isLoading.value = false
    newMessage.value = ''
  }
}
</script>

<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" 
           :key="index" 
           :class="['message', message.role]"
           v-show="message.role !== 'system'">
        {{ message.content }}
      </div>
    </div>
    
    <div class="input-container">
      <input 
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Задайте свой вопрос Таро..."
        :disabled="isLoading"
      />
      <button 
        @click="sendMessage"
        :disabled="isLoading || !newMessage.trim()"
      >
        {{ isLoading ? 'Раскладываю карты...' : 'Спросить' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
}

.message {
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  max-width: 80%;
  line-height: 1.6;
}

.message.user {
  background-color: #4a4a6a;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.message.assistant {
  background-color: #2d2d4d;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.8em 1.2em;
  border-radius: 8px;
  border: 1px solid #333;
  background-color: rgba(0, 0, 0, 0.2);
  color: inherit;
}

button {
  background-color: #4a4a6a;
  color: #fff;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #5a5a7a;
  border-color: #8a8aaa;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 