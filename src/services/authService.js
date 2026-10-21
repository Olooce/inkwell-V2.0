import apiClient, { getErrorMessage, tokenStorage } from './apiClient'
import { userStore } from '@/stores/userStore'
import { createAuthPayload } from '@/utils/auth_utils'

const SESSION_KEYS = ['user-data', 'assessment-state', 'story-drafts', 'chatHistory']

export const authService = {
  async login(email, password) {
    const normalizedEmail = email.trim()
    try {
      const payload = await createAuthPayload(normalizedEmail, password)
      const { data } = await apiClient.post('/auth/login', payload)
      if (!data?.access) throw new Error('No access token received')

      tokenStorage.set(data.access, data.refresh)
      userStore.setUser(data.user)
      return data
    } catch (error) {
      // The backend answers 401 for both unknown emails and wrong passwords.
      if (error.response?.status === 401) throw new Error('Incorrect email or password.')
      throw new Error(getErrorMessage(error, 'Couldn’t sign you in. Please try again.'))
    }
  },

  async register({ email, password, firstName, lastName }) {
    const normalizedEmail = email.trim()
    try {
      await apiClient.post('/auth/register', {
        email: normalizedEmail,
        username: normalizedEmail.split('@')[0],
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists. Try logging in instead.')
      }
      throw new Error(getErrorMessage(error, 'Couldn’t create your account. Please try again.'))
    }
  },

  logout() {
    tokenStorage.clear()
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
    userStore.clearUser()
  },

  isAuthenticated() {
    return Boolean(tokenStorage.getAccess()?.startsWith('Bearer '))
  },
}
