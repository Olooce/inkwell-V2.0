<template>
  <div class="assessment-layout">
    <Navigation :user-name="userName" />

    <main class="assessment-content">
      <div v-if="currentQuestion" class="question-container">
        <div class="progress-indicator">
          Question {{ progress.current }} of {{ progress.total }}
        </div>

        <!-- Masked Word Question Type -->
        <template v-if="currentQuestion.question_type === 'masked'">
          <h2 class="instruction">
            Fill in the blank with the most appropriate word:
          </h2>
          <div class="sentence-container">
            <div class="sentence">
              {{ formatMaskedSentence(currentQuestion.masked_sentence) }}
            </div>
            <input
              v-model="userAnswer"
              class="answer-input"
              placeholder="Type your answer..."
              @keyup.enter="submitAnswer"
              :disabled="loading"
            />
          </div>
        </template>

        <!-- Error Correction Question Type -->
        <template v-else>
          <h2 class="instruction">
            Correct the error in this sentence:
          </h2>
          <div class="sentence-container">
            <div class="sentence error">
              {{ currentQuestion.error_sentence }}
            </div>
            <input
              v-model="userAnswer"
              class="answer-input"
              placeholder="Type the corrected sentence..."
              @keyup.enter="submitAnswer"
              :disabled="loading"
            />
          </div>
        </template>

        <button
          class="submit-btn"
          @click="submitAnswer"
          :disabled="!userAnswer || loading"
        >
          Submit
        </button>
      </div>

      <!-- Feedback Modal -->
      <v-dialog v-model="showFeedback" max-width="500px">
        <v-card>
          <v-card-title class="feedback-title" :class="{'text-success': feedback.isCorrect}">
            {{ feedback.isCorrect ? 'Correct!' : 'Keep Learning!' }}
          </v-card-title>
          <v-card-text class="feedback-text">
            {{ feedback.message }}
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              color="primary"
              @click="handleContinue"
              :loading="loading"
            >
              {{ isLastQuestion ? 'Complete Assessment' : 'Next Question' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { assessmentStore } from '@/stores/assessmentStore'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const userName = computed(() => {
  return userStore.state.firstName.value ||
         userStore.state.email.value?.split('@')[0] ||
         'Guest'
})


const userAnswer = ref('')
const loading = ref(false)
const showFeedback = ref(false)
const feedback = ref({ isCorrect: false, message: '' })

const currentQuestion = computed(() => assessmentStore.getCurrentQuestion())
const progress = computed(() => assessmentStore.getProgress())
const isLastQuestion = computed(() =>
  progress.value.current === progress.value.total
)

const formatMaskedSentence = (sentence) => {
  return sentence?.replace('[MASK]', '_____') || ''
}

console.log('Handling completion, navigating to dashboard...');

const submitAnswer = async () => {
  if (!userAnswer.value || loading.value) return

  loading.value = true
  try {
    const result = await assessmentStore.submitAnswer(userAnswer.value)
    feedback.value = {
      isCorrect: result.is_correct,
      message: result.feedback
    }
    showFeedback.value = true

    if (result.completed) {
      handleCompletion()
    }
  } catch (error) {
    console.error('Error submitting answer:', error)
  } finally {
    loading.value = false
  }
}

const handleContinue = () => {
  showFeedback.value = false
  userAnswer.value = ''

  if (isLastQuestion.value) {
    handleCompletion()
  } else {
    assessmentStore.nextQuestion()
  }
}

const handleCompletion = () => {
  userStore.state.initial_assessment_completed.value = true

  // Update stored user data
  const userData = JSON.parse(localStorage.getItem('user-data') || '{}')
  userData.initial_assessment_completed = true
  localStorage.setItem('user-data', JSON.stringify(userData))

  // Redirect to dashboard
  router.push('/dashboard')
}
</script>

<style scoped>
.assessment-layout {
  min-height: 100vh;
  background-color: white;
}

.assessment-content {
  padding: 2rem;
  max-width: 800px;
  margin: 80px auto 0;
}

.question-container {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-indicator {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-family: 'Fredoka', sans-serif;
}

.instruction {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.sentence-container {
  margin-bottom: 2rem;
}

.sentence {
  font-size: 1.2rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.answer-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  color: white;
  background: var(--color-light-blue);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Fredoka', sans-serif;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.feedback-title {
  font-family: 'Fredoka', sans-serif;
  text-align: center;
  font-size: 1.5rem;
}

.feedback-text {
  text-align: center;
  padding: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}
</style>
