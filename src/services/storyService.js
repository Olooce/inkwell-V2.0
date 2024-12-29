import apiClient from './apiClient'

export const storyService = {
  async startStory(title) {
    try {
      const response = await apiClient.post('/stories/start_story/', { title })
      return response.data
    } catch (error) {
      console.error('Start story error:', error.response?.data || error)
      throw new Error(error.response?.data?.error || 'Failed to start story')
    }
  },

  async addSentence(storyId, sentence) {
    try {
      const response = await apiClient.post(`/stories/${storyId}/add_sentence/`, {
        sentence
      })
      return response.data
    } catch (error) {
      console.error('Add sentence error:', error.response?.data || error)
      throw new Error(error.response?.data?.error || 'Failed to add sentence')
    }
  },

  async completeStory(storyId) {
    try {
      const response = await apiClient.post(`/stories/${storyId}/complete_story/`)
      return response.data
    } catch (error) {
      console.error('Complete story error:', error.response?.data || error)
      throw new Error(error.response?.data?.error || 'Failed to complete story')
    }
  },

  async getProgress() {
    try {
      const response = await apiClient.get('/stories/progress/')
      return response.data
    } catch (error) {
      console.error('Get progress error:', error.response?.data || error)
      throw new Error(error.response?.data?.error || 'Failed to get progress')
    }
  },

  async getAllStories() {
    try {
      const response = await apiClient.get('/stories/')
      return response.data
    } catch (error) {
      console.error('Get stories error:', error.response?.data || error)
      throw new Error(error.response?.data?.error || 'Failed to get stories')
    }
  }
}