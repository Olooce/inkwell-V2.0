import { ref } from 'vue'
import apiClient from '@/services/apiClient'

const state = {
  currentSession: ref(null),
  questions: ref([]),
  currentQuestionIndex: ref(0),
  answers: ref([])
}

export const assessmentStore = {
  state,

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
      const response = await apiClient.post('/assessment/start_assessment/')
      state.currentSession.value = response.data.session_id
      state.questions.value = response.data.questions
      state.currentQuestionIndex.value = 0
      state.answers.value = []
      return response.data
    } catch (error) {
      console.error('Start assessment error:', error)
      throw error
    }
  },

  async submitAnswer(answer) {
    try {
      const currentQuestion = this.getCurrentQuestion()
      if (!currentQuestion) throw new Error('No current question')

      const response = await apiClient.post('/assessment/submit_answer/', {
        session_id: state.currentSession.value,
        question_id: currentQuestion.id,
        answer: answer
      })

      state.answers.value = [...state.answers.value, {
        questionId: currentQuestion.id,
        answer: answer,
        isCorrect: response.data.is_correct,
        feedback: response.data.feedback
      }]

      return response.data
    } catch (error) {
      console.error('Submit answer error:', error)
      throw error
    }
  },

  nextQuestion() {
    if (state.currentQuestionIndex.value < state.questions.value.length - 1) {
      state.currentQuestionIndex.value++
      return true
    }
    return false
  },

  resetAssessment() {
    state.currentSession.value = null
    state.questions.value = []
    state.currentQuestionIndex.value = 0
    state.answers.value = []
  }
}