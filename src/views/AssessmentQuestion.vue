dd<template>
  <div class="assessment-layout">
    <Navigation :user-name="userName" />

    <main class="assessment-content">
      <div v-if="currentQuestion" class="question-container">
        <div class="progress-indicator">
          Question {{ progress.current }} of {{ progress.total }}
        </div>

        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Checking your answer...</p>
        </div>

        <div v-else>
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

      <!-- Completion Modal -->
      <v-dialog v-model="showCompletionModal" max-width="500px">
        <v-card>
          <v-card-title class="feedback-title text-primary">
            Assessment Complete!
          </v-card-title>
          <v-card-text class="feedback-text">
            You have completed your assessment. You can now proceed to the dashboard to create a story.
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              color="success"
              @click="redirectToDashboard"
            >
              Go to Dashboard
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
import { toast } from 'vue3-toastify'

const router = useRouter()
const userName = computed(() => {
  return userStore.state.firstName.value ||
    userStore.state.email.value?.split('@')[0] ||
    'Guest'
})

const userAnswer = ref('')
const loading = ref(false)
const showFeedback = ref(false)
const showCompletionModal = ref(false)
const feedback = ref({ isCorrect: false, message: '' })

const currentQuestion = computed(() => assessmentStore.getCurrentQuestion())
const progress = computed(() => assessmentStore.getProgress())
const isLastQuestion = computed(() =>
  progress.value.current === progress.value.total
)

const formatMaskedSentence = (sentence) => {
  return sentence?.replace('[MASK]', '_____') || ''
}

const submitAnswer = async () => {
  if (!userAnswer.value || loading.value) return

  loading.value = true
  try {
    const result = await assessmentStore.submitAnswer(userAnswer.value)
    feedback.value = {
      isCorrect: result.isCorrect,
      message: result.feedback
    }

      showFeedback.value = true

  } catch (error) {
    // If the error indicates that the question is already answered
    if (error.response && error.response.data.error === 'Question already answered') {
      // Directly continue to the next question or completion
      handleContinue()
    } else {
      toast.error(error.message)
    }
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

  const userData = JSON.parse(localStorage.getItem('user-data') || '{}')
  userData.initial_assessment_completed = true
  localStorage.setItem('user-data', JSON.stringify(userData))

  assessmentStore.resetAssessment()

  showCompletionModal.value = true
}

const redirectToDashboard = () => {
  showCompletionModal.value = false
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px; /* Adjust based on the container size */
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top: 4px solid var(--color-light-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: var(--color-light-blue);
  font-family: 'Fredoka', sans-serif;
}
</style>
