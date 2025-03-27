import { ref } from 'vue'
import apiClient from '@/services/apiClient'
import { toast } from 'vue3-toastify'

const state = {
  currentSession: ref(null),
  questions: ref([]),
  currentQuestionIndex: ref(0),
  answers: ref([])
}

export const assessmentStore = {
  state,

  // Load persisted data from localStorage
  loadPersistedData() {
    const persistedState = localStorage.getItem('assessment-state')
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState)
        state.currentSession.value = parsedState.currentSession
        state.questions.value = parsedState.questions
        state.currentQuestionIndex.value = parsedState.currentQuestionIndex
        state.answers.value = parsedState.answers
      } catch (error) {
        toast.error(error.message)
        this.resetAssessment()  // If error occurs, reset to initial state
      }
    }
  },

  // Save state to localStorage
  saveStateToLocalStorage() {
    const stateToPersist = {
      currentSession: state.currentSession.value,
      questions: state.questions.value,
      currentQuestionIndex: state.currentQuestionIndex.value,
      answers: state.answers.value
    }
    localStorage.setItem('assessment-state', JSON.stringify(stateToPersist))
  },

  getCurrentQuestion() {
    return state.questions.value[state.currentQuestionIndex.value] || null
  },

  getProgress() {
    return {
      current: state.currentQuestionIndex.value + 1,
      total: state.questions.value.length
    }
  },

  async startAssessment() {
    try {
      const response = await apiClient.post('/assessments/start')
      state.currentSession.value = response.data.session_id
      state.questions.value = response.data.questions
      state.currentQuestionIndex.value = 0
      state.answers.value = []

      // Save the state after starting assessment
      this.saveStateToLocalStorage()

      return response.data
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  },


async submitAnswer(answer) {
  try {
    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) throw new Error('No current question')

    const payload = {
      session_id: state.currentSession.value,  // Extract .value
      question_id: currentQuestion.id,
      answer: answer
    }

    const response = await apiClient.post('/assessments/submit', payload)

    state.answers.value = [...state.answers.value, {
      questionId: currentQuestion.id,
      answer: answer,
      isCorrect: response.data.isCorrect,
      feedback: response.data.feedback
    }]

    this.saveStateToLocalStorage()  // Persist state

    return response.data
  } catch (error) {
    toast.error(error.message)
    throw error
  }
},

  nextQuestion() {
    if (state.currentQuestionIndex.value < state.questions.value.length - 1) {
      state.currentQuestionIndex.value++
      // Save the state after moving to the next question
      this.saveStateToLocalStorage()
      return true
    }
    return false
  },

  resetAssessment() {
    state.currentSession.value = null
    state.questions.value = []
    state.currentQuestionIndex.value = 0
    state.answers.value = []

    // Clear state from localStorage
    localStorage.removeItem('assessment-state')
  }
}
