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

<style scoped>
/* Модальное окно */
.tarot-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.tarot-modal__content {
  background: #000000;
  padding: 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  border: 2px solid #DAA520;
}

.tarot-modal__title {
  color: #FFD700;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Форма */
.tarot-form__group {
  margin-bottom: 2rem;
}

.tarot-form__label {
  display: block;
  margin-bottom: 0.8rem;
  color: #FFD700;
  font-size: 1.1rem;
}

.tarot-form__input,
.tarot-form__textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #B8860B;
  border-radius: 8px;
  background: rgba(218, 165, 32, 0.1);
  color: #FFD700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tarot-form__input:focus,
.tarot-form__textarea:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.tarot-form__textarea {
  height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.tarot-form__submit {
  width: 100%;
  padding: 1.2rem;
  margin-top: 1rem;
  background: linear-gradient(145deg, #B8860B, #DAA520);
  color: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tarot-form__submit:hover:not(:disabled) {
  background: linear-gradient(145deg, #DAA520, #FFD700);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
}

.tarot-form__submit--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Медиа-запросы */
@media (max-width: 480px) {
  .tarot-modal__content {
    padding: 1.5rem;
  }

  .tarot-modal__title {
    font-size: 1.5rem;
  }

  .tarot-form__group {
    margin-bottom: 1.5rem;
  }

  .tarot-form__input,
  .tarot-form__textarea,
  .tarot-form__submit {
    padding: 0.8rem;
  }
}
</style> 