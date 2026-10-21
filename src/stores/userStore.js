import { ref, computed } from 'vue'

const STORAGE_KEY = 'user-data'

const state = {
  email: ref(''),
  firstName: ref(''),
  lastName: ref(''),
  isAuthenticated: ref(false),
  initial_assessment_completed: ref(false),
}

const persist = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      email: state.email.value,
      first_name: state.firstName.value,
      last_name: state.lastName.value,
      initial_assessment_completed: state.initial_assessment_completed.value,
    }),
  )
}

export const userStore = {
  state,

  displayName: computed(() => state.firstName.value || state.email.value.split('@')[0] || 'Writer'),

  initials: computed(() => {
    const letters = `${state.firstName.value.charAt(0)}${state.lastName.value.charAt(0)}`
    return (letters || state.email.value.charAt(0) || '?').toUpperCase()
  }),

  setUser(userData = {}) {
    state.email.value = userData.email || ''
    state.firstName.value = userData.first_name || ''
    state.lastName.value = userData.last_name || ''
    state.isAuthenticated.value = true
    state.initial_assessment_completed.value = userData.initial_assessment_completed === true
    persist()
  },

  markAssessmentCompleted() {
    state.initial_assessment_completed.value = true
    persist()
  },

  clearUser() {
    state.email.value = ''
    state.firstName.value = ''
    state.lastName.value = ''
    state.isAuthenticated.value = false
    state.initial_assessment_completed.value = false
    localStorage.removeItem(STORAGE_KEY)
  },

  loadStoredUser() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      this.setUser(JSON.parse(stored))
    } catch {
      this.clearUser()
    }
  },
}
