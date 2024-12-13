<script setup>
import { ref, onMounted } from 'vue'
import UserDataModal from './UserDataModal.vue'
import TarotCards from './TarotCards.vue'

const messages = ref([])
const isLoading = ref(false)
const showUserModal = ref(true)
const showTarotCards = ref(false)
const userData = ref(null)
const selectedCard = ref(null)
const prediction = ref('')

onMounted(() => {
  messages.value = [{
    role: 'system',
    content: 'Ты - опытный Таролог с глубокими познаниями в картах Таро, нумерологии и эзотерике. ' +
             'Ты всегда отвечаешь в стиле мудрого предсказателя, используя соответствующую терминологию ' +
             'и образы. В своих ответах ты часто ссылаешься на карты Таро, их значения и взаимосвязи. ' +
             'Твои ответы должны быть мистическими, но при этом понятными и полезными для клиента.'
  }]
})

function handleUserData(data) {
  userData.value = data
  showUserModal.value = false
  showTarotCards.value = true
}

function handleCardSelect(card) {
  selectedCard.value = card
  showTarotCards.value = false
  providePrediction()
}

async function providePrediction() {
  const predictionPrompt = `
    Имя: ${userData.value.name}
    Дата рождения: ${userData.value.birthDate}
    Время рождения: ${userData.value.birthTime}
    Вопрос: ${userData.value.question}
    
    Выбранная карта: ${selectedCard.value.name}
    Значение карты: ${selectedCard.value.meaning_up}
    Перевернутое значение: ${selectedCard.value.meaning_rev}
    
    Пожалуйста, дай развернутое предсказание, основываясь на этих данных.
  `

  messages.value.push({
    role: 'user',
    content: predictionPrompt
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
        temperature: 0.9
      })
    })

    const data = await response.json()
    prediction.value = data.choices[0].message.content
  } catch (error) {
    console.error('Error:', error)
    prediction.value = 'Карты сейчас молчат. Давайте попробуем еще раз через некоторое время.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="tarot-chat">
    <UserDataModal 
      v-if="showUserModal"
      @submit="handleUserData"
    />

    <TarotCards
      v-else-if="showTarotCards"
      @card-select="handleCardSelect"
    />

    <div v-else class="tarot-prediction">
      <div v-if="isLoading" class="tarot-prediction__loader">
        <div class="tarot-prediction__crystal">🔮</div>
        <p class="tarot-prediction__loading-text">
          Читаю карты и вижу ваше будущее...
        </p>
      </div>
      
      <div v-else class="tarot-prediction__content">
        <h3 class="tarot-prediction__title">Ваше предсказание</h3>
        <div class="tarot-prediction__text">
          {{ prediction }}
        </div>
        <button 
          class="tarot-prediction__button" 
          @click="showUserModal = true"
        >
          Новое гадание
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tarot-chat {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #000000;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  min-height: 400px;
  border: 2px solid #DAA520;
}

.tarot-prediction {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.tarot-prediction__loader {
  text-align: center;
}

.tarot-prediction__crystal {
  font-size: 4rem;
  animation: float 2s ease-in-out infinite;
}

.tarot-prediction__loading-text {
  margin-top: 1rem;
  color: #DAA520;
  font-style: italic;
}

.tarot-prediction__content {
  width: 100%;
  padding: 2rem;
}

.tarot-prediction__title {
  color: #FFD700;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.tarot-prediction__text {
  background: rgba(218, 165, 32, 0.1);
  padding: 2rem;
  border-radius: 12px;
  line-height: 1.8;
  margin-bottom: 2rem;
  white-space: pre-line;
  border: 1px solid #B8860B;
  color: #FFD700;
}

.tarot-prediction__button {
  display: block;
  width: 200px;
  margin: 2rem auto 0;
  padding: 1rem;
  background: linear-gradient(145deg, #B8860B, #DAA520);
  color: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.tarot-prediction__button:hover {
  background: linear-gradient(145deg, #DAA520, #FFD700);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 