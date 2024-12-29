import { ref } from 'vue'
import { storyService } from '@/services/storyService'

const state = {
  currentStory: ref(null),
  sentences: ref([]),
  storyStatus: ref('not_started'), // not_started, in_progress, completed
  maxSentences: ref(0),
  currentSentenceCount: ref(0),
  error: ref(null)
}

export const storyStore = {
  state,

  async startStory(title) {
    try {
      state.error.value = null
      const response = await storyService.startStory(title)
      
      state.currentStory.value = {
        id: response.story_id,
        title,
        guidance: response.guidance
      }
      state.maxSentences.value = response.max_sentences
      state.storyStatus.value = 'in_progress'
      state.sentences.value = []
      state.currentSentenceCount.value = 0
      
      return response
    } catch (error) {
      state.error.value = error.message
      throw error
    }
  },

  async addSentence(sentence) {
    try {
      state.error.value = null
      const response = await storyService.addSentence(
        state.currentStory.value.id, 
        sentence
      )
      
      state.sentences.value = [...state.sentences.value, response.sentence]
      state.currentSentenceCount.value = state.sentences.value.length
      
      return response
    } catch (error) {
      state.error.value = error.message
      throw error
    }
  },

  async completeStory() {
    try {
      state.error.value = null
      const response = await storyService.completeStory(state.currentStory.value.id)
      state.storyStatus.value = 'completed'
      return response
    } catch (error) {
      state.error.value = error.message
      throw error
    }
  },

  clearStory() {
    state.currentStory.value = null
    state.sentences.value = []
    state.storyStatus.value = 'not_started'
    state.maxSentences.value = 0
    state.currentSentenceCount.value = 0
    state.error.value = null
  }
}