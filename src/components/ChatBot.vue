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
    console.log('📤 Sending request with data:', {
      model: 'grok-beta',
      messages: messages.value,
      temperature: 0.9
    })

    // Добавляем Promise.race для таймаута на клиенте
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('CLIENT_TIMEOUT')), 40000)
    })

    const fetchPromise = fetch('/api/chat', {
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

    const response = await Promise.race([fetchPromise, timeoutPromise])
    console.log('📥 Response status:', response.status)

    // Пробуем прочитать тело ответа как текст сначала
    const responseText = await response.text()
    console.log('📄 Raw response:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ JSON Parse Error:', e)
      throw new Error('INVALID_RESPONSE')
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || 'API_ERROR')
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('INVALID_FORMAT')
    }
    
    prediction.value = data.choices[0].message.content
  } catch (error) {
    console.error('❌ Error:', error)
    
    // Обработка различных типов ошибок
    switch(error.message) {
      case 'CLIENT_TIMEOUT':
        prediction.value = 'Карты задумались слишком надолго. Пожалуйста, попробуйте еще раз.'
        break
      case 'INVALID_RESPONSE':
        prediction.value = 'Получен некорректный ответ. Пожалуйста, попробуйте еще раз.'
        break
      case 'INVALID_FORMAT':
        prediction.value = 'Карты ответили непонятно. Пожалуйста, попробуйте еще раз.'
        break
      case 'API_ERROR':
        prediction.value = 'Произошла ошибка при обращении к картам. Пожалуйста, попробуйте позже.'
        break
      default:
        prediction.value = 'Карты сейчас молчат. Пожалуйста, попробуйте еще раз через некоторое время.'
    }
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
        <div class="tarot-prediction__crystal">
          <span role="img" aria-label="crystal ball">🔮</span>
        </div>
        <p class="tarot-prediction__loading-text">
          Карты раскрывают свои тайны...
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