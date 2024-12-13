<script setup>
import { ref, onMounted } from 'vue'
import { tarotDeck } from '../data/tarotDeck'

const props = defineProps({
  onCardSelect: Function
})

const cards = ref([])
const selectedCard = ref(null)
const showCardModal = ref(false)
const isFlipping = ref(false)
const isShuffling = ref(true)

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

onMounted(() => {
  cards.value = [...tarotDeck].map((card, index) => ({
    ...card,
    initialPosition: index,
    shufflePosition: { x: 0, y: 0 },
    isVisible: false
  }))

  cards.value.forEach((card, index) => {
    setTimeout(() => {
      card.isVisible = true
    }, index * 100)
  })

  setTimeout(() => {
    startShuffleAnimation()
  }, cards.value.length * 100 + 500)
})

function startShuffleAnimation() {
  const totalDuration = 6000 // Увеличиваем длительность
  const phases = 5 // Больше фаз для большей хаотичности
  let currentPhase = 0
  
  function shuffle() {
    cards.value.forEach(card => {
      // Случайное направление движения
      const direction = Math.random() * Math.PI * 2
      // Случайная дистанция
      const distance = 100 + Math.random() * 300
      // Случайная скорость вращения
      const rotation = (Math.random() - 0.5) * 720 // До двух полных оборотов

      // Добавляем случайное смещение по диагонали
      const diagonalOffset = {
        x: Math.cos(direction) * distance,
        y: Math.sin(direction) * distance
      }

      // Добавляем случайное движение к краям экрана
      const edgeOffset = {
        x: (Math.random() < 0.5 ? -1 : 1) * Math.random() * window.innerWidth * 0.3,
        y: (Math.random() < 0.5 ? -1 : 1) * Math.random() * window.innerHeight * 0.3
      }

      // Комбинируем смещения
      card.shufflePosition = {
        x: diagonalOffset.x + edgeOffset.x,
        y: diagonalOffset.y + edgeOffset.y,
        rotation: rotation,
        scale: 0.8 + Math.random() * 0.4 // Случайное масштабирование
      }
    })

    currentPhase++
    
    if (currentPhase < phases * 2) {
      // Случайная задержка между фазами для большей хаотичности
      const delay = 200 + Math.random() * 300
      setTimeout(shuffle, delay)
    } else {
      // Финальное перемешивание и возврат на места
      cards.value = shuffleArray(cards.value)
      setTimeout(() => {
        cards.value.forEach(card => {
          card.shufflePosition = { 
            x: 0, 
            y: 0, 
            rotation: 0,
            scale: 1
          }
        })
        isShuffling.value = false
      }, 500)
    }
  }

  shuffle()
}

function selectCard(card) {
  if (isShuffling.value) return
  selectedCard.value = card
  isFlipping.value = true
  
  setTimeout(() => {
    showCardModal.value = true
    isFlipping.value = false
  }, 1000)
}

function confirmCardSelection() {
  const adaptedCard = {
    name: selectedCard.value.name,
    meaning_up: selectedCard.value.meaning.upright,
    meaning_rev: selectedCard.value.meaning.reversed
  }
  props.onCardSelect(adaptedCard)
  showCardModal.value = false
}
</script>

<template>
  <div class="tarot-table">
    <h2 class="tarot-table__title">Выберите карту, которая вас притягивает</h2>
    <p class="tarot-table__description">
      Перед вами все карты Старших Арканов. Прислушайтесь к своей интуиции и выберите ту, 
      которая кажется наиболее значимой для вашего вопроса.
    </p>
    <div class="tarot-table__grid">
      <div 
        v-for="(card, index) in cards" 
        :key="card.name"
        class="tarot-card"
        :class="{
          'tarot-card--flipped': isFlipping && selectedCard === card,
          'tarot-card--shuffling': isShuffling,
          'tarot-card--visible': card.isVisible
        }"
        :style="{
          transform: `translate(${card.shufflePosition?.x || 0}px, ${card.shufflePosition?.y || 0}px)
                     rotate(${card.shufflePosition?.rotation || 0}deg)
                     scale(${card.shufflePosition?.scale || 1})`,
          transition: isShuffling ? 'transform 0.3s ease-in-out' : 'transform 0.8s ease-in-out',
          opacity: card.isVisible ? 1 : 0,
          zIndex: isShuffling ? Math.floor(Math.random() * 1000) : 'auto'
        }"
        @click="selectCard(card)"
      >
        <div class="tarot-card__inner">
          <div class="tarot-card__back">
            <img class="tarot-card__image" src="/card-back.png" alt="Card Back" />
            <span class="tarot-card__number">{{ index + 1 }}</span>
          </div>
          <div class="tarot-card__front">
            <img class="tarot-card__image" src="/card-face.png" alt="Card Face" />
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для показа выбранной карты -->
    <div v-if="showCardModal" class="tarot-modal">
      <div class="tarot-modal__content">
        <div class="tarot-modal__image-container">
          <img class="tarot-modal__image" src="/card-face.png" alt="Selected Card" />
        </div>
        <div class="tarot-modal__info">
          <h3 class="tarot-modal__title">{{ selectedCard.name }}</h3>
          <p class="tarot-modal__arcana">{{ selectedCard.arcana }}</p>
          <p class="tarot-modal__description">{{ selectedCard.description }}</p>
          <div class="tarot-modal__meanings">
            <div class="tarot-modal__meaning tarot-modal__meaning--upright">
              <h4 class="tarot-modal__meaning-title">Прямое значение:</h4>
              <p class="tarot-modal__meaning-text">{{ selectedCard.meaning.upright }}</p>
            </div>
            <div class="tarot-modal__meaning tarot-modal__meaning--reversed">
              <h4 class="tarot-modal__meaning-title">Перевернутое значение:</h4>
              <p class="tarot-modal__meaning-text">{{ selectedCard.meaning.reversed }}</p>
            </div>
          </div>
          <div class="tarot-modal__actions">
            <button 
              class="tarot-modal__button" 
              @click="confirmCardSelection"
            >
              Получить предсказание
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Основной контейнер */
.tarot-table {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #000000;
}

.tarot-table__title {
  text-align: center;
  color: #FFD700;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.tarot-table__description {
  text-align: center;
  color: #DAA520;
  margin: 0 auto 2.5rem;
  font-style: italic;
  max-width: 800px;
  line-height: 1.6;
}

.tarot-table__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  min-height: 600px;
  perspective: 1000px;
  transform-style: preserve-3d;
  overflow: visible;
}

/* Карта */
.tarot-card {
  perspective: 1000px;
  aspect-ratio: 11/19;
  cursor: pointer;
  position: relative;
  opacity: 0;
  transform-origin: center center;
  max-width: 150px;
  margin: 0 auto;
}

.tarot-card--visible {
  opacity: 1;
  transition: opacity 0.3s ease-in-out, transform 0.8s ease-in-out;
}

.tarot-card--shuffling {
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tarot-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.tarot-card--flipped .tarot-card__inner {
  transform: rotateY(180deg);
}

.tarot-card__back,
.tarot-card__front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
  border: 2px solid #B8860B;
  transition: all 0.3s ease;
}

.tarot-card__back {
  background: linear-gradient(145deg, #000000, #1a1a1a);
}

.tarot-card__front {
  background: #000000;
  transform: rotateY(180deg);
}

.tarot-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarot-card__number {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(218, 165, 32, 0.3);
  color: #FFD700;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  backdrop-filter: blur(2px);
}

/* Модальное окно */
.tarot-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.tarot-modal__content {
  display: flex;
  gap: 2.5rem;
  max-width: 900px;
  width: 90%;
  background: #000000;
  border: 2px solid #DAA520;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
  padding: 2.5rem;
  border-radius: 16px;
}

/* Изображение карты в модальном окне */
.tarot-modal__image-container {
  flex: 0 0 auto;
  width: 300px;
  aspect-ratio: 11/19;
}

.tarot-modal__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #B8860B;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

/* Информация о карте */
.tarot-modal__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tarot-modal__title {
  color: #FFD700;
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.tarot-modal__arcana {
  color: #DAA520;
  font-style: italic;
  font-size: 1.1rem;
}

.tarot-modal__description {
  color: #DAA520;
  font-style: italic;
  font-size: 1.1rem;
}

.tarot-modal__meanings {
  display: grid;
  gap: 1.5rem;
}

.tarot-modal__meaning {
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(218, 165, 32, 0.1);
  border: 1px solid #B8860B;
  transition: all 0.3s ease;
}

.tarot-modal__meaning:hover {
  background: rgba(218, 165, 32, 0.15);
  border-color: #DAA520;
}

.tarot-modal__meaning-title {
  color: #FFD700;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

/* Кнопка подтверждения */
.tarot-modal__button {
  width: 100%;
  max-width: 300px;
  padding: 1rem;
  background: linear-gradient(145deg, #B8860B, #DAA520);
  color: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 1rem auto 0;
}

.tarot-modal__button:hover {
  background: linear-gradient(145deg, #DAA520, #FFD700);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
}

/* Эффекты свечения */
.tarot-card--shuffling::after {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 15px;
  background: rgba(255, 215, 0, 0.15);
  filter: blur(12px);
  animation: glowStronger 0.3s ease-in-out infinite alternate;
}

@keyframes glowStronger {
  from {
    opacity: 0.3;
    transform: scale(1);
  }
  to {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Медиа-запросы */
@media (max-width: 768px) {
  .tarot-modal__content {
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .tarot-modal__image-container {
    width: 200px;
  }

  .tarot-table__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
  }

  .tarot-table__title {
    font-size: 1.8rem;
  }
}
</style> 