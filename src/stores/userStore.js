import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const state = {
  email: ref(''),
  firstName: ref(''),
  lastName: ref(''),
  isAuthenticated: ref(false),
  initial_assessment_completed: ref(false)
}

export const userStore = {
  state,

  setUser(userData) {
    state.email.value = userData.email
    state.firstName.value = userData.first_name
    state.lastName.value = userData.last_name
    state.isAuthenticated.value = true
    state.initial_assessment_completed.value = Boolean(userData.initial_assessment_completed)

    localStorage.setItem('user-data', JSON.stringify(userData))


    // console.log('User store updated:', {
    //   email: state.email.value,
    //   firstName: state.firstName.value,
    //   lastName: state.lastName.value,
    //   isAuthenticated: state.isAuthenticated.value,
    //   initial_assessment_completed: state.initial_assessment_completed.value
    // })
  },

  clearUser() {
    state.email.value = ''
    state.firstName.value = ''
    state.lastName.value = ''
    state.isAuthenticated.value = false
    state.initial_assessment_completed.value = false
    localStorage.removeItem('user-data')
  },

  loadStoredUser() {
    const storedData = localStorage.getItem('user-data')
    if (storedData) {
      try {
        const userData = JSON.parse(storedData)
        this.setUser({
          ...userData,
          initial_assessment_completed: userData.initial_assessment_completed === true
        })
      } catch (error) {
        toast.error(error.message)
        this.clearUser()
      }
    }
  }
}
