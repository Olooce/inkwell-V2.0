import apiClient from '@/services/apiClient'

export const MAX_SENTENCES = 5

const DRAFTS_KEY = 'story-drafts'

const readDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}
  } catch {
    return {}
  }
}

const writeDrafts = (drafts) => localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))

export const storyStore = {
  async getActiveStory() {
    try {
      const { data } = await apiClient.get('/stories/progress')
      if (data?.story_status !== 'in_progress') return null
      return {
        id: data.story_id,
        title: data.title,
        sentenceCount: data.current_sentence_count,
        maxSentences: data.current_sentence_count + data.max_sentences,
      }
    } catch (error) {
      if (error.response?.status === 500) return null
      throw error
    }
  },

  /** Starts a story. If one is unfinished the backend returns that one instead (`resumed: true`). */
  async startStory(title) {
    const { status, data } = await apiClient.post('/stories/start_story', { title })
    const resumed = status === 200
    return {
      resumed,
      id: data.story_id,
      title: resumed ? data.title : title,
      sentenceCount: data.current_sentence_count,
      maxSentences: resumed ? data.current_sentence_count + data.max_sentences : data.max_sentences,
    }
  },

  async addSentence(storyId, sentence) {
    const { data } = await apiClient.post(`/stories/${storyId}/add_sentence`, { sentence })
    const drafts = readDrafts()
    drafts[storyId] = [...(drafts[storyId] || []), data.sentence]
    writeDrafts(drafts)
    return data.sentence
  },

  async completeStory(storyId) {
    await apiClient.post(`/stories/${storyId}/complete_story`)
    const drafts = readDrafts()
    delete drafts[storyId]
    writeDrafts(drafts)
  },

  getSavedSentences(storyId) {
    return readDrafts()[storyId] || []
  },
}
