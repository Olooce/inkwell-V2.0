import apiClient from './apiClient'

export const assessmentService = {
  async startAssessment() {
    try {
      const response = await apiClient.post('/assessment/start_assessment/')
      return response.data
    } catch (error) {
      console.error('Start assessment error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Failed to start assessment')
    }
  },

  async submitAnswer(sessionId, questionId, answer) {
    try {
      const response = await apiClient.post('/assessment/submit_answer/', {
        session_id: sessionId,
        question_id: questionId,
        answer: answer
      })
      return response.data
    } catch (error) {
      console.error('Submit answer error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Failed to submit answer')
    }
  },

  async completeAssessment(sessionId) {
    try {
      const response = await apiClient.get('/assessment/complete_assessment/', {
        session_id: sessionId
      })
      return response.data
    } catch (error) {
      console.error('Complete assessment error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Failed to complete assessment')
    }
  }
}