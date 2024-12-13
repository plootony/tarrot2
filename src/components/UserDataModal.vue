<script setup>
import { ref, defineEmits, computed } from 'vue'

const emit = defineEmits(['submit'])

const userData = ref({
  name: 'Анна',
  birthDate: '1990-05-15',
  birthTime: '14:30',
  question: 'Как сложится моя личная жизнь в ближайшие полгода?'
})

const isValid = computed(() => {
  return userData.value.name && 
         userData.value.birthDate && 
         userData.value.birthTime && 
         userData.value.question
})

function handleSubmit() {
  if (isValid.value) {
    emit('submit', userData.value)
  }
}
</script>

<template>
  <div class="tarot-modal">
    <div class="tarot-modal__content">
      <h2 class="tarot-modal__title">🔮 Добро пожаловать в мир Таро</h2>
      <form class="tarot-form" @submit.prevent="handleSubmit">
        <div class="tarot-form__group">
          <label class="tarot-form__label">Ваше имя:</label>
          <input 
            class="tarot-form__input"
            v-model="userData.name" 
            type="text" 
            required
          />
        </div>
        
        <div class="tarot-form__group">
          <label class="tarot-form__label">Дата рождения:</label>
          <input 
            class="tarot-form__input"
            v-model="userData.birthDate" 
            type="date" 
            required
          />
        </div>

        <div class="tarot-form__group">
          <label class="tarot-form__label">Время рождения:</label>
          <input 
            class="tarot-form__input"
            v-model="userData.birthTime" 
            type="time" 
            required
          />
        </div>

        <div class="tarot-form__group">
          <label class="tarot-form__label">Ваш вопрос:</label>
          <textarea 
            class="tarot-form__textarea"
            v-model="userData.question" 
            required
            placeholder="Например: Как мне найти друзей?"
          ></textarea>
        </div>

        <button 
          class="tarot-form__submit" 
          type="submit" 
          :class="{'tarot-form__submit--disabled': !isValid}"
          :disabled="!isValid"
        >
          Начать гадание
        </button>
      </form>
    </div>
  </div>
</template> 