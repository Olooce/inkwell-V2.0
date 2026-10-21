import { ref } from 'vue'
import apiClient from '@/services/apiClient'

const STORAGE_KEY = 'assessment-state'

const state = {
  currentSession: ref(null),
  topic: ref(''),
  questions: ref([]),
  currentQuestionIndex: ref(0),
  answers: ref([]),
}

const persist = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentSession: state.currentSession.value,
      topic: state.topic.value,
      questions: state.questions.value,
      currentQuestionIndex: state.currentQuestionIndex.value,
      answers: state.answers.value,
    }),
  )
}

export const assessmentStore = {
  state,

  loadPersistedData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (!saved?.currentSession) return
      state.currentSession.value = saved.currentSession
      state.topic.value = saved.topic || ''
      state.questions.value = saved.questions || []
      state.currentQuestionIndex.value = saved.currentQuestionIndex || 0
      state.answers.value = saved.answers || []
    } catch {
      this.resetAssessment()
    }
  },

  hasSessionInProgress() {
    return Boolean(state.currentSession.value && state.questions.value.length)
  },

  getCurrentQuestion() {
    return state.questions.value[state.currentQuestionIndex.value] || null
  },

  getProgress() {
    return {
      current: state.currentQuestionIndex.value + 1,
      total: state.questions.value.length,
    }
  },

  async startAssessment() {
    const { data } = await apiClient.post('/assessments/start')
    if (!data.questions?.length) {
      const error = new Error('No questions are available right now. Please try again later.')
      error.isUserFacing = true
      throw error
    }
    state.currentSession.value = data.session_id
    state.topic.value = data.topic
    state.questions.value = data.questions
    state.currentQuestionIndex.value = 0
    state.answers.value = []
    persist()
    return data
  },

  /** Submits an answer for the current question. Returns `{ isCorrect, feedback }`. */
  async submitAnswer(answer) {
    const question = this.getCurrentQuestion()
    if (!question) throw new Error('No current question')

    const { data } = await apiClient.post('/assessments/submit', {
      session_id: state.currentSession.value,
      question_id: question.id,
      answer,
    })

    const result = { isCorrect: data.is_correct === true, feedback: data.feedback }
    state.answers.value = [...state.answers.value, { questionId: question.id, answer, ...result }]
    persist()
    return result
  },

  nextQuestion() {
    if (state.currentQuestionIndex.value >= state.questions.value.length - 1) return false
    state.currentQuestionIndex.value++
    persist()
    return true
  },

  resetAssessment() {
    state.currentSession.value = null
    state.topic.value = ''
    state.questions.value = []
    state.currentQuestionIndex.value = 0
    state.answers.value = []
    localStorage.removeItem(STORAGE_KEY)
  },
}
