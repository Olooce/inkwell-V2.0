import apiClient from './apiClient'
import { userStore } from '@/stores/userStore'
import { createAuthPayload } from '@/utils/auth_utils'

export const authService = {
  async login(email, password) {
    try {
      // Generate authhash
      const authPayload = await createAuthPayload(email, password)

      // Send login request
      const response = await apiClient.post('/auth/login', authPayload)
      const { access, refresh, user } = response.data

      userStore.setUser(user)

      if (access) {
        const token = `Bearer ${access}`
        localStorage.setItem('user-token', token)
        localStorage.setItem('refresh-token', refresh)

        return response.data
      }
      throw new Error('Login failed - no access token received')
    } catch (error) {
      toast.error(error.message)
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        username: userData.email.split('@')[0],
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name
      })

      return response.data
    } catch (error) {
      const errorData = error.response?.data || {}
      let errorMessage = 'Registration failed'

      if (errorData.email?.length) {
        errorMessage = errorData.email[0]
      } else if (errorData.username?.length) {
        errorMessage = errorData.username[0]
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      }

      throw new Error(errorMessage)
    }
  },

  logout() {
    userStore.clearUser()
    localStorage.removeItem('user-token')
    localStorage.removeItem('refresh-token')
    localStorage.removeItem('user-data')
    localStorage.clear()
  },

  getToken() {
    return localStorage.getItem('user-token')
  },

  isAuthenticated() {
    const token = this.getToken()
    return token && token.startsWith('Bearer ')
  }
}
