import apiClient from './apiClient'

// Tips arrive as one newline-separated string split server-side; tidy list markers and blanks.
const cleanTips = (tips) =>
  (tips || [])
    .map((t) => t.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)

/**
 * Completed stories with their feedback, newest first. The backend lists a story as soon as it
 * is finished, before the analysis has run; those come back with `pending: true`.
 */
export const getAnalysedStories = async () => {
  const { data } = await apiClient.get('/writing-skills/analysis/')
  return (data?.stories || [])
    .map((s) => {
      const tips = cleanTips(s.tips)
      return { ...s, tips, pending: !s.analysis?.trim() && !tips.length }
    })
    .sort((a, b) => b.story_id - a.story_id)
}
