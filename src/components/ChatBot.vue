<script setup>
import { ref, onMounted, computed } from 'vue'
import UserDataModal from './UserDataModal.vue'
import TarotCards from './TarotCards.vue'

const messages = ref([])
const isLoading = ref(false)
const showUserModal = ref(true)
const showTarotCards = ref(false)
const userData = ref(null)
const selectedCard = ref(null)
const prediction = ref('')

const predictionParagraphs = computed(() => 
  prediction.value.split('\n\n').filter(p => p.trim())
);

const SYSTEM_MESSAGE = 'Ты - опытный Таролог...'

onMounted(() => {
  messages.value = [{
    role: 'system',
    content: SYSTEM_MESSAGE
  }]
})

function handleUserData(data) {
  userData.value = data
  showUserModal.value = false
  showTarotCards.value = true
}

function handleCardSelect(card) {
  const isReversed = Math.random() < 0.5
  
  selectedCard.value = {
    ...card,
    isReversed,
    currentMeaning: isReversed ? card.meaning_rev : card.meaning_up
  }
  
  showTarotCards.value = false
  providePrediction()
}

async function providePrediction() {
  console.log('🎴 Starting prediction request...')
  
  const predictionPrompt = `
    Имя: ${userData.value.name}
    Дата рождения: ${userData.value.birthDate}
    Время рождения: ${userData.value.birthTime}
    Вопрос: ${userData.value.question}
    
    Выбранная карта: ${selectedCard.value.name} ${selectedCard.value.isReversed ? '(в перевернутом положении)' : ''}
    Значение карты: ${selectedCard.value.currentMeaning}
    
    Пожалуйста, дай развернутое предсказание, основываясь на этих данных. ${
      selectedCard.value.isReversed ? 'Обрати особое внимание, что карта выпала в перевернутом положении.' : ''
    }
  `

  messages.value.push({
    role: 'user',
    content: predictionPrompt
  })

  isLoading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: messages.value,
        temperature: 0.9
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Response error:', errorText)
      throw new Error('Ошибка при получении ответа от сервера')
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('API error:', data.error, data.details)
      throw new Error(data.error)
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Некорректный формат ответа')
    }
    
    prediction.value = data.choices[0].message.content
  } catch (error) {
    console.error('❌ Error:', error)
    prediction.value = `Карты сейчас молчат. ${error.message || 'Пожалуйста, попробуйте еще раз через некоторое время.'}`
  } finally {
    isLoading.value = false
    console.log('🏁 Prediction request completed')
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
        <div class="tarot-prediction__crystal">
          <span role="img" aria-label="crystal ball">🔮</span>
        </div>
        <p class="tarot-prediction__loading-text">
          Карты раскры��ают свои тайны...
        </p>
      </div>
      
      <div v-else class="tarot-prediction__content">
        <h3 class="tarot-prediction__title">Ваше предсказание</h3>
        <div class="tarot-prediction__text">
          <p v-for="(paragraph, index) in predictionParagraphs" 
             :key="index">
            {{ paragraph }}
          </p>
        </div>
        <button 
          class="tarot-prediction__button" 
          @click="showUserModal = true"
        >
          Узнать еще
        </button>
      </div>
    </div>
  </div>
</template> 