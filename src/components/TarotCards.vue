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
    isVisible: false
  }))

  cards.value = shuffleArray(cards.value)

  cards.value.forEach((card, index) => {
    setTimeout(() => {
      card.isVisible = true
    }, index * 50)
  })
})

function selectCard(card) {
  if (isFlipping.value) return
  
  selectedCard.value = card
  isFlipping.value = true
  card.isReversed = Math.random() < 0.5
  showCardModal.value = true
}

function confirmCardSelection() {
  const adaptedCard = {
    name: selectedCard.value.name,
    meaning_up: selectedCard.value.meaning.upright,
    meaning_rev: selectedCard.value.meaning.reversed,
    isReversed: selectedCard.value.isReversed
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
          'tarot-card--visible': card.isVisible
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

    <div v-if="showCardModal" class="tarot-modal">
      <div class="tarot-modal__content">
        <div class="tarot-modal__image-container">
          <img 
            class="tarot-modal__image" 
            :class="{ 'tarot-modal__image--reversed': selectedCard.isReversed }"
            src="/card-face.png" 
            alt="Selected Card" 
          />
        </div>
        <div class="tarot-modal__info">
          <h3 class="tarot-modal__title">{{ selectedCard.name }}</h3>
          <p class="tarot-modal__arcana">{{ selectedCard.arcana }}</p>
          <p class="tarot-modal__position">
            {{ selectedCard.isReversed ? '(в перевернутом положении)' : '(в прямом положении)' }}
          </p>
          <p class="tarot-modal__description">{{ selectedCard.description }}</p>
          <div class="tarot-modal__meanings">
            <div class="tarot-modal__meaning">
              <h4 class="tarot-modal__meaning-title">
                {{ selectedCard.isReversed ? 'Перевернутое значение:' : 'Прямое значение:' }}
              </h4>
              <p class="tarot-modal__meaning-text">
                {{ selectedCard.isReversed ? selectedCard.meaning.reversed : selectedCard.meaning.upright }}
              </p>
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

<style lang="scss" scoped>
.tarot-table {
  padding: $spacing-large;
  
  @include responsive(mobile) {
    padding: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-base;
    
    @include responsive(mobile) {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-small;
      padding: $spacing-small;
    }
  }

  &__title {
    @include responsive(mobile) {
      font-size: 1.5rem;
      padding: 0 $spacing-small;
    }
  }

  &__description {
    @include responsive(mobile) {
      font-size: 1rem;
      padding: 0 $spacing-small;
      margin-bottom: $spacing-base;
    }
  }
}

.tarot-card {
  position: relative;
  aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease-out;
  
  &--visible {
    opacity: 1;
  }
  
  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
  }
  
  &__front,
  &__back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: $border-radius;
    background: $gradient-dark;
    box-shadow: $shadow-md;
    overflow: hidden;
  }
  
  &__front {
    transform: rotateY(180deg);
    background: $gradient-primary;
  }
  
  &:hover:not(.tarot-card--flipped) {
    transform: translateY(-5px);
    
    .tarot-card__back {
      box-shadow: $shadow-hover;
    }
  }
  
  &--flipped {
    .tarot-card__inner {
      transform: rotateY(180deg);
    }
  }

  @include responsive(mobile) {
    aspect-ratio: 2/3;
  }
}

.tarot-modal {
  &__image {
    transition: transform 0.5s ease;
    
    &--reversed {
      transform: rotate(180deg);
    }
  }

  &__position {
    color: $color-text-secondary;
    font-style: italic;
    text-align: center;
    margin-bottom: $spacing-base;
  }
}
</style>